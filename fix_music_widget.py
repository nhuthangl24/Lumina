import re

file_path = "src/components/focus/MusicPlayerWidget.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Replace the Spotify Iframe API initialization logic
old_init = r'''  // Khởi tạo Spotify IFrame API
  useEffect\(\(\) => \{
    const script = document\.createElement\("script"\);
    script\.src = "https://open\.spotify\.com/embed/iframe-api/v1";
    script\.async = true;
    document\.body\.appendChild\(script\);

    window\.onSpotifyIframeApiReady = \(IFrameAPI\) => \{
      const element = containerRef\.current;
      if \(!element\) return;
      
      const options = \{
        uri: `spotify:playlist:\$\{spotifyId\}`,
        width: '100%',
        height: '80',
        theme: '0'
      \};
      
      IFrameAPI\.createController\(element, options, \(EmbedController: any\) => \{
        controllerRef\.current = EmbedController;
      \}\);
    \};

    return \(\) => \{
      if \(document\.body\.contains\(script\)\) \{
        document\.body\.removeChild\(script\);
      \}
    \};
  \}, \[\]\);'''

new_init = '''  // Khởi tạo Spotify IFrame API
  useEffect(() => {
    const initSpotify = (IFrameAPI: any) => {
      const element = containerRef.current;
      if (!element) return;
      
      // Đảm bảo không bị duplicate iframe khi component re-render
      element.innerHTML = '';
      const div = document.createElement('div');
      element.appendChild(div);
      
      const options = {
        uri: `spotify:playlist:${spotifyId}`,
        width: '100%',
        height: '80',
        theme: '0'
      };
      
      IFrameAPI.createController(div, options, (EmbedController: any) => {
        controllerRef.current = EmbedController;
        // Bắt sự kiện khi iframe sẵn sàng
        EmbedController.addListener('ready', () => {
           if (isPowerOn) EmbedController.play();
        });
      });
    };

    if ((window as any).SpotifyIframeApi) {
      initSpotify((window as any).SpotifyIframeApi);
    } else {
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        (window as any).SpotifyIframeApi = IFrameAPI;
        initSpotify(IFrameAPI);
      };
    }
  }, []);'''

content = content.replace(old_init, new_init)

# Also fix the update playlist logic to handle standard tracks (spotify:track:)
# because loadUri might fail if we hardcode "spotify:playlist:" for a track ID
old_update = r'''  // Update playlist khi user đổi link
  useEffect\(\(\) => \{
    if \(controllerRef\.current\) \{
      controllerRef\.current\.loadUri\(`spotify:playlist:\$\{spotifyId\}`\);
      if \(isPowerOn\) \{
        // Cố gắng tự động play playlist mới nếu đang bật nguồn
        setTimeout\(\(\) => \{
          controllerRef\.current\.play\(\);
        \}, 500\);
      \}
    \}
  \}, \[spotifyId\]\);'''

new_update = '''  // Update playlist khi user đổi link
  useEffect(() => {
    if (controllerRef.current) {
      // Xác định xem ID là playlist hay track
      // ID của Spotify playlist thường dài 22 ký tự
      const uri = spotifyId.length === 22 && !spotifyId.includes(':') 
        ? `spotify:playlist:${spotifyId}` 
        : (spotifyId.includes(':') ? spotifyId : `spotify:track:${spotifyId}`);
        
      controllerRef.current.loadUri(uri);
      
      if (isPowerOn) {
        setTimeout(() => {
          controllerRef.current.play();
        }, 1000); // Tăng delay xíu để iframe kịp load
      }
    }
  }, [spotifyId]);'''

content = content.replace(old_update, new_update)

# Also fix handleUpdatePlaylist to better extract track/playlist ID
old_handle = r'''    if \(id\.includes\("spotify\.com/playlist/"\)\) \{
      const parts = id\.split\("playlist/"\)\[1\];
      id = parts\.split\("\?"\)\[0\];
    \} else if \(id\.includes\("spotify\.com/album/"\)\) \{
      const parts = id\.split\("album/"\)\[1\];
      id = parts\.split\("\?"\)\[0\];
    \}
    const finalId = id\.split\("/"\)\.pop\(\)\?\.split\("\?"\)\[0\] \|\| id;'''

new_handle = '''    let finalId = id;
    if (id.includes("spotify.com/")) {
      const url = new URL(id);
      const pathSegments = url.pathname.split('/');
      // vd: /playlist/37i9dQZF1DXcBWIGoYBM5M -> ['','playlist','37i9dQZF1DXcBWIGoYBM5M']
      if (pathSegments.length >= 3) {
        const type = pathSegments[1]; // playlist, track, album
        const spotifyIdBase = pathSegments[2];
        finalId = `spotify:${type}:${spotifyIdBase}`;
      }
    } else {
      // Nếu user dán thẳng ID 22 ký tự
      finalId = id.split("?")[0];
    }'''

content = content.replace(old_handle, new_handle)

with open(file_path, "w") as f:
    f.write(content)
