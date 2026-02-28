import React, { useRef, useEffect } from 'react';
import { Theme } from '../App';

interface CommentsProps {
  theme: Theme;
}

const Comments: React.FC<CommentsProps> = ({ theme }) => {
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const commentsContainer = commentsRef.current;
    if (!commentsContainer) return;

    // Clear any existing comments instance
    while (commentsContainer.firstChild) {
      commentsContainer.removeChild(commentsContainer.firstChild);
    }

    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.async = true;
    
    // IMPORTANT: Replace this with your own public GitHub repo.
    // The repo must have the Utterances app installed.
    script.setAttribute('repo', 'jinubify/website-comments'); 
    
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('crossorigin', 'anonymous');
    
    // Determine theme for Utterances based on the site's theme state
    const utteranceTheme = theme === 'dark' ? 'github-dark' : 'github-light';
    
    script.setAttribute('theme', utteranceTheme);

    commentsContainer.appendChild(script);

  }, [theme]);

  return <div ref={commentsRef} id="comments-container" />;
};

export default Comments;