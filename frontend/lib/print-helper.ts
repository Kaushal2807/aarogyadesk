import toast from 'react-hot-toast';

export function printUrlSilently(url: string) {
  let secondsLeft = 5;
  const toastId = toast.loading(`Generating PDF... Please wait (${secondsLeft}s)`, {
    style: {
      background: '#f59e0b', // Yellow color
      color: '#ffffff',
      fontWeight: '600',
      fontSize: '13px',
      borderRadius: '10px',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#f59e0b',
    },
  });

  const interval = setInterval(() => {
    secondsLeft -= 1;
    if (secondsLeft > 0) {
      toast.loading(`Generating PDF... Please wait (${secondsLeft}s)`, {
        id: toastId,
        style: {
          background: '#f59e0b',
          color: '#ffffff',
          fontWeight: '600',
          fontSize: '13px',
          borderRadius: '10px',
        },
      });
    } else {
      clearInterval(interval);
      toast.success('PDF generated successfully!', {
        id: toastId,
        duration: 3000,
        style: {
          background: '#10b981',
          color: '#ffffff',
          fontWeight: '600',
          fontSize: '13px',
          borderRadius: '10px',
        },
      });
    }
  }, 1000);

  const existing = document.getElementById('silent-print-iframe');
  if (existing) {
    try {
      document.body.removeChild(existing);
    } catch {}
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'silent-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);

  // Auto clean iframe after print completes or timeout
  setTimeout(() => {
    try {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    } catch {}
  }, 10000);
}
