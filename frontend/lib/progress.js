'use client';

import NProgress from 'nprogress';

let configured = false;

export function setupProgressBar() {
  if (configured) return;
  configured = true;

  // Keep transitions smooth and subtle for route feedback.
  NProgress.configure({
    showSpinner: false,
    minimum: 0.08,
    trickleSpeed: 120,
    easing: 'ease',
    speed: 300,
  });
}

export function startProgress() {
  setupProgressBar();
  NProgress.start();
}

export function doneProgress() {
  NProgress.done();
}

