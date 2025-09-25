import time
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter(tags=["uptime"])


@router.get("/uptime/stream")
async def uptime_stream():
    """
    Server-sent events (SSE) endpoint that streams the server uptime every second.
    """
    start_time = time.time()
    
    async def event_generator():
        while True:
            uptime_seconds = int(time.time() - start_time)
            yield f"data: {uptime_seconds}\n\n"
            await asyncio.sleep(1)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        },
    )