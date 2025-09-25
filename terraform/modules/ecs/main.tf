resource "aws_ecs_cluster" "main" {
  name = "${var.project}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "${var.project}-${var.environment}-cluster"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_security_group" "alb" {
  # Use name_prefix instead of name to avoid conflicts with existing resources
  name_prefix  = "${var.project}-${var.environment}-alb-sg-"
  description  = "Security group for ALB (including CloudFront access)"
  vpc_id       = var.vpc_id

  # Lifecycle management to handle resource replacement
  lifecycle {
    create_before_destroy = true
  }

  ingress {
    protocol    = "tcp"
    from_port   = 80
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP traffic from anywhere (including CloudFront)"
  }

  ingress {
    protocol    = "tcp"
    from_port   = 443
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTPS traffic from anywhere (including CloudFront)"
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project}-${var.environment}-alb-sg"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_security_group" "ecs_tasks" {
  # Use name_prefix to avoid conflicts with existing resources
  name_prefix  = "${var.project}-${var.environment}-ecs-tasks-sg-"
  description  = "Allow inbound traffic from ALB only"
  vpc_id       = var.vpc_id

  # Lifecycle management to handle resource replacement
  lifecycle {
    create_before_destroy = true
  }

  ingress {
    protocol    = "tcp"
    from_port   = var.app_port
    to_port     = var.app_port
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow traffic to backend app port"
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project}-${var.environment}-ecs-tasks-sg"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_alb" "main" {
  name               = "${var.project}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnets

  # Add dependency on security group to ensure proper destroy order
  depends_on = [aws_security_group.alb]

  # Enable deletion protection in non-dev environments
  enable_deletion_protection = var.environment != "dev"

  tags = {
    Name        = "${var.project}-${var.environment}-alb"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_alb_target_group" "backend" {
  name        = "${var.project}-${var.environment}-backend-tg"
  port        = var.app_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
  
  # Increased timeouts for API requests
  deregistration_delay = 30

  health_check {
    path                = "/api/v1/health"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 10          # Increased timeout
    healthy_threshold   = 2
    unhealthy_threshold = 5           # More tolerant of occasional failures
  }

  tags = {
    Name        = "${var.project}-${var.environment}-backend-tg"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_alb_listener" "http" {
  load_balancer_arn = aws_alb.main.id
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.backend.id
  }

  # Add explicit dependency on ALB and target group
  depends_on = [
    aws_alb.main,
    aws_alb_target_group.backend
  ]

  # Setting lifecycle to ensure proper destruction order
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.project}-${var.environment}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-ecs-task-execution-role"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_iam_role" "ecs_task_role" {
  name = "${var.project}-${var.environment}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-ecs-task-role"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_policy" "ecs_task_policy" {
  name        = "${var.project}-${var.environment}-ecs-task-policy"
  description = "Policy for ECS tasks"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameters",
          "ssm:GetParameter",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_role_policy" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_task_policy.arn
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project}-${var.environment}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "${var.project}-${var.environment}-backend"
      image     = "${var.backend_image_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = var.app_port
          hostPort      = var.app_port
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.project}-${var.environment}-backend"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      environment = [
        {
          name  = "ENVIRONMENT"
          value = var.environment
        }
        # Add other environment variables as needed
      ]
    }
  ])

  tags = {
    Name        = "${var.project}-${var.environment}-backend-task"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project}-${var.environment}-backend"
  retention_in_days = 30

  tags = {
    Name        = "${var.project}-${var.environment}-backend-logs"
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_ecs_service" "backend" {
  name                               = "${var.project}-${var.environment}-backend-service"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.backend.arn
  desired_count                      = 1
  launch_type                        = "FARGATE"
  platform_version                   = "LATEST"
  health_check_grace_period_seconds  = 60
  enable_execute_command             = true

  network_configuration {
    subnets          = var.public_subnets
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.backend.arn
    container_name   = "${var.project}-${var.environment}-backend"
    container_port   = var.app_port
  }

  # Forces new deployment on application restart
  force_new_deployment = true

  # Proper dependencies to ensure correct order in creation and destruction
  depends_on = [
    aws_alb_listener.http,
    aws_alb.main,
    aws_alb_target_group.backend
  ]

  # Setting proper lifecycle hooks to prevent destroy errors
  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.project}-${var.environment}-backend-service"
    Environment = var.environment
    Project     = var.project
  }
}
