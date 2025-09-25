# system imports
import argparse
from pathlib import Path
import json

# third party imports
import easyocr
import numpy as np
import cv2  # OpenCV for visualization
from PIL import Image

# local imports
from client_data.client_passport import ClientPassport, GenderEnum

FIELD_BB ={
    "issuing_country": [(10,21), (370,21), (370,40), (10,40)],
    "country_code": [(130, 55), (184, 55), (184, 69), (130, 69)],
    "surname": [(22, 98), (120, 98), (120,116), (22, 116)],
    "given_name": [(131, 98), (230, 98), (230,115), (131, 115)],
    "number": [(245, 55), (317, 55), (317, 69), (245, 69)],
    "birth_date": [(23, 139), (110, 139), (110, 155), (23, 155)],
    "citizenship": [(135, 139), (290, 139), (290, 155), (135, 155)],
    "issue_date": [(135, 179), (209,179), ( 209, 195), (135, 195)],
    "expiry_date": [(135, 209), (209, 209), (209, 225), (135, 225)],
    "sex": [(22, 177), (45, 177), (45, 200), (22, 200)],
    "signature": [(250, 209), (369, 209), (369, 240), (250, 240)],
    "MRZ_line1": [(15,248), (350,248), (350,262), (15,262)],
    "MRZ_line2": [(15,260), (350,260), (350,272), (15,272)],
}


class PassportParserEasyOCR:
    def __init__(self, *args, **kwargs):
        self.reader = easyocr.Reader(['en'])  # specify the language
        self.threshold = 0.1  # default threshold for OCR confidence
        
        if "threshold" in kwargs:
            self.threshold = kwargs["threshold"]

    def parse(self, passport_file_path: Path) -> ClientPassport:
        
        def crop_image(np_image: np.ndarray, bounding_box: list[tuple[int, int]]) -> np.ndarray:
            """
            Crop the image using the bounding box coordinates.
            """
            # Calculate the min/max coordinates to crop the image
            x_coords = [point[0] for point in bounding_box]
            y_coords = [point[1] for point in bounding_box]
            
            min_x, max_x = max(0, min(x_coords)), min(np_image.shape[1], max(x_coords))
            min_y, max_y = max(0, min(y_coords)), min(np_image.shape[0], max(y_coords))
            
            # Crop the image to the region
            return np_image[min_y:max_y, min_x:max_x]
        
        def post_process_MRZ(extracted_fields: dict) -> dict:
            """
            Post-process the extracted text to clean it up.
            """
            # Join the extracted text and strip whitespace
            passport_mrz = []
            for field in ["MRZ_line1", "MRZ_line2"]:
                cleaned_list = [value for value in extracted_fields[field] if value is not None]
                passport_mrz.append("".join(cleaned_list))
                extracted_fields.pop(field)
            extracted_fields["passport_mrz"] = passport_mrz  
            return extracted_fields 
        
        def post_process_signature(extracted_fields: dict) -> dict:
            """
            Post-process the extracted signature field.
            """
            # Check if the signature field is empty or contains only None values
            if extracted_fields["signature"] is None or all(value is None for value in extracted_fields["signature"]):
                extracted_fields["signature"] = False
            else:
                extracted_fields["signature"] = True
            return extracted_fields
        
        def post_process_sex(extracted_fields: dict) -> dict:
            if extracted_fields["sex"] is None:
                raise ValueError("Sex was not parsed correctly")
            
            extracted_fields["sex"] = GenderEnum.convert_str_to_enum(extracted_fields["sex"]) 
            return extracted_fields  
            
        
        # Read the image using EasyOCR
        if not passport_file_path.exists():
            raise FileNotFoundError(f"File '{passport_file_path}' does not exist")
        
        image = Image.open(passport_file_path)
        image_np = np.array(image)
            
        extraction_results = dict()    
            
        for region_name, bbox in FIELD_BB.items():
            # Crop the image using the bounding box
            region_image = crop_image(image_np, bbox)
            
            # Process the region
            region_results = self.reader.readtext(region_image)
            
            if not region_results:
                extraction_results[region_name] = None
                print(f"No text found in region '{region_name}'")
                continue
            
            extracted_text = []
            
            for r_bbox, text, prob in region_results:
            # Only include results above the confidence threshold
                if prob >= self.threshold:
                    # Add text to the filtered list
                    extracted_text.append(text)
                else:
                    print(f"Text detection: {text} with Low confidence: {prob}")
                    extracted_text.append(None)
                
                extraction_results[region_name] = extracted_text if len(extracted_text) > 1 else extracted_text[0]
        
        post_process_MRZ(extraction_results)
        post_process_signature(extraction_results)
        post_process_sex(extraction_results)
        
        return ClientPassport(**extraction_results)
    
    def visualize_bounding_boxes(self, passport_file_path: Path):
        """
        Visualize the bounding boxes on the passport image.
        """
        image = Image.open(passport_file_path)
        image_np = np.array(image)
        
        # Create a copy for drawing
        vis_image = None
        
        # Convert to BGR if needed (for OpenCV compatibility)
        if len(image_np.shape) == 3 and image_np.shape[2] == 4:  # RGBA image
            vis_image = cv2.cvtColor(image_np, cv2.COLOR_RGBA2BGR)
        elif len(image_np.shape) == 3 and image_np.shape[2] == 3:  # RGB image
            vis_image = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        else:  # Grayscale or other format
            vis_image = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        
        for region_name, bbox in FIELD_BB.items():
            # Convert bbox to the format OpenCV expects for polylines
            pts = np.array(bbox, np.int32)
            pts = pts.reshape((-1, 1, 2))
            # Draw red polygon with thickness=2
            cv2.polylines(vis_image, [pts], isClosed=True, color=(0, 0, 255), thickness=1)
            # Add region name as label
            cv2.putText(vis_image, region_name, (bbox[0][0], bbox[0][1]-10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
        
        output_path = passport_file_path.parent / f"{passport_file_path.stem}_bbs{passport_file_path.suffix}"
        cv2.imwrite(str(output_path), vis_image)


def export_to_json(data: dict, input_image_path: Path):
    # Export the extracted text dictionary to a JSON file
    json_output_path = input_image_path.parent / f"{input_image_path.stem}.json"
    
    with open(json_output_path, 'w', encoding='utf-8') as json_file:
        data_encoding = json.dumps(data, indent=4, ensure_ascii=False)
        json_file.write(data_encoding)

def parse_arguments():
    parser = argparse.ArgumentParser(description="Extract text from images using OCR")
    parser.add_argument("--file", "-f", type=str, required=True, 
                        help="Path to the image file to process")
    parser.add_argument("--visualize", "-v", action="store_true",
                        help="Visualize bounding boxes on the image and save")
    parser.add_argument("--threshold", "-t", type=float, default=0.1,
                        help="Confidence threshold for OCR results (default: 0.1)")
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_arguments()
    image_path = args.file
    
    image_path_obj = Path(image_path)
    
    # Verify the file exists
    if not image_path_obj.exists():
        print(f"Error: File '{image_path_obj.absolute()}' does not exist")
        exit(1)
    
    parser = PassportParserEasyOCR(threshold=args.threshold)
    
    extracted_data = parser.parse(image_path_obj)
    
    print(f"Extracted data: {extracted_data}")
    extracted_data.validate_fields()
    
    if args.visualize:
        parser.visualize_bounding_boxes(image_path_obj)
        
    


