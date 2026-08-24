import re
import os

files = [
    "src/app/api/rooms/[id]/leave/route.ts",
    "src/app/api/rooms/[id]/checkin/route.ts",
    "src/app/api/rooms/[id]/timer/route.ts",
    "src/app/api/rooms/[id]/join/route.ts"
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            content = f.read()
        
        # Replace pusher.trigger with broadcastEvent
        content = content.replace("pusher.trigger", "broadcastEvent")
        
        with open(file_path, "w") as f:
            f.write(content)
