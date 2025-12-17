/**
 * YouTube Markdown Extension for Showdown
 * Converts YouTube links to embedded iframes
 * Supports youtube.com/watch?v= and youtu.be/ URLs
 */
const youtubeExtension = {
    type: 'output',
    regex: /<p><a href="https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\d\-_]+)[^"]*">.+<\/a><\/p>/g,
    replace: function(match, videoId) {
        return `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin-bottom: 1rem; border-radius: 0.5rem;">
                    <iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
                </div>`;
    }
};

// Make extension globally available for main.js
window.youtubeExtension = youtubeExtension;
