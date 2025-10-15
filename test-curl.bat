@echo off
echo Testing notification endpoints...
echo.

echo Step 1: Creating notification...
curl -X POST http://localhost:8000/api/quick/create-notification ^
  -H "Content-Type: application/json" ^
  -d "{\"user_id\": \"b1eb759c-129e-4cf8-afed-76f689c5bc37\"}"
echo.
echo.

echo Step 2: Checking quick notifications...
curl http://localhost:8000/api/quick/notifications/b1eb759c-129e-4cf8-afed-76f689c5bc37
echo.
echo.

echo Step 3: Testing main API...
curl http://localhost:8000/api/notifications/user/b1eb759c-129e-4cf8-afed-76f689c5bc37
echo.
echo.

echo Tests completed!