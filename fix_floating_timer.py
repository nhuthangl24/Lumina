import re

file_path = "src/components/focus/FloatingTimer.tsx"
with open(file_path, "r") as f:
    content = f.read()

old_toggle = r'''  const toggleTimer = \(\) => \{
    if \(timeLeft > 0\) setIsRunning\(!isRunning\);
  \};'''

new_toggle = '''  const toggleTimer = async () => {
    if (roomId) {
      if (!isHost) {
        alert("Chỉ chủ phòng mới có thể bắt đầu/dừng thời gian!");
        return;
      }
      const action = isRunning ? "stop" : (mode === "focus" ? "start_focus" : "start_break");
      await fetch(`/api/rooms/${roomId}/timer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, duration: initialTime })
      });
    } else {
      if (timeLeft > 0) setIsRunning(!isRunning);
    }
  };'''

content = content.replace(old_toggle, new_toggle)


old_stop = r'''  const stopTimer = \(\) => \{
    setIsRunning\(false\);
    setTimeLeft\(initialTime\);
    localStorage\.removeItem\("promodo_timer_target"\);
    localStorage\.setItem\("promodo_timer_paused", initialTime\.toString\(\)\);
  \};'''

new_stop = '''  const stopTimer = async () => {
    if (roomId) {
      if (!isHost) return;
      await fetch(`/api/rooms/${roomId}/timer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" })
      });
    } else {
      setIsRunning(false);
      setTimeLeft(initialTime);
      localStorage.removeItem("promodo_timer_target");
      localStorage.setItem("promodo_timer_paused", initialTime.toString());
    }
  };'''

content = content.replace(old_stop, new_stop)


old_skip = r'''  const skipSession = \(\) => \{
    handleTimerComplete\(\);
  \};'''

new_skip = '''  const skipSession = async () => {
    if (roomId) {
      if (!isHost) return;
      await fetch(`/api/rooms/${roomId}/timer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" })
      });
    } else {
      handleTimerComplete();
    }
  };'''

content = content.replace(old_skip, new_skip)

old_mode = r'''  const handleModeChange = \(newMode: "focus" \| "break"\) => \{
    setMode\(newMode\);
    setIsRunning\(false\);
    loadSettingsTime\(newMode\);
  \};'''

new_mode = '''  const handleModeChange = async (newMode: "focus" | "break") => {
    if (roomId) {
      if (!isHost) {
        alert("Chỉ chủ phòng mới có thể đổi chế độ!");
        return;
      }
      await fetch(`/api/rooms/${roomId}/timer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" })
      });
      // Mode thay đổi local nhưng sẽ chờ nhấn Play để báo server
      setMode(newMode);
    } else {
      setMode(newMode);
      setIsRunning(false);
      loadSettingsTime(newMode);
    }
  };'''

content = content.replace(old_mode, new_mode)

with open(file_path, "w") as f:
    f.write(content)
