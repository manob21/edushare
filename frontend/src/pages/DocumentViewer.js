import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';
const FILE_ORIGIN = 'http://localhost:5000';

function ext(name = '') {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

export default function DocumentViewer() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(125); // PDF.js viewer zoom (%)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploads, setUploads] = useState(0);
  const viewerFrameRef = useRef(null);
  const viewerShellRef = useRef(null);
  const [autoScrollActive, setAutoScrollActive] = useState(false);
  const [autoScrollAnchor, setAutoScrollAnchor] = useState({ x: 0, y: 0 });
  const autoScrollTimerRef = useRef(null);
  const autoScrollDeltaRef = useRef({ y: 0 });

  const canDownload = uploads >= 3;
  const isPdf = resource && ext(resource.fileName) === 'pdf';
  
  // Determine if user should see preview or full document
  const shouldShowPreview = !isAuthenticated || !canDownload;

  const viewerUrl = useMemo(() => {
    if (!resource) return null;
    const isPdf = resource.fileName?.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      // Use preview endpoint for restricted users, full view for authorized users
      const endpoint = shouldShowPreview ? 'preview' : 'view';
      const file = `${FILE_ORIGIN}/api/resource/${endpoint}/${id}`;
      return `/pdf-viewer/index.html?file=${encodeURIComponent(file)}`;
    }
    return resource.fileUrl ? `${FILE_ORIGIN}${resource.fileUrl}` : null;
  }, [resource, id, shouldShowPreview]);

  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const r = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
          const d = await r.json();
          if (r.ok) { setIsAuthenticated(true); setUploads(d.user.uploadCount || 0); }
        }
      } catch {}
      try {
        setLoading(true); setError(null);
        const r = await fetch(`${API_URL}/resource/${id}`);
        const d = await r.json();
        if (r.ok && d.resource) setResource(d.resource); else setError('Failed to load resource');
      } catch {
        setError('Failed to load resource');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const zoomIn = useCallback(() => setZoom(z => Math.min(400, z + 25)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(25, z - 25)), []);
  const zoomReset = useCallback(() => setZoom(125), []);

  const postToViewer = useCallback(payload => {
    const frame = viewerFrameRef.current;
    frame?.contentWindow?.postMessage(payload, '*');
  }, []);

  const scrollViewerBy = useCallback(deltaY => {
    postToViewer({ type: 'scrollBy', dy: deltaY });
  }, [postToViewer]);

  const scrollViewerTo = useCallback(pos => {
    postToViewer({ type: 'scrollTo', pos });
  }, [postToViewer]);


  const stopAutoScroll = useCallback(() => {
    setAutoScrollActive(false);
    autoScrollDeltaRef.current = { y: 0 };
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  }, []);

  const toggleAutoScroll = useCallback(e => {
    if (autoScrollActive) {
      stopAutoScroll();
      return;
    }
    setAutoScrollAnchor({ x: e.clientX, y: e.clientY });
    autoScrollDeltaRef.current = { y: 0 };
    setAutoScrollActive(true);
  }, [autoScrollActive, stopAutoScroll]);

  useEffect(() => {
    const onKey = e => {
      const targetTag = e.target?.tagName?.toLowerCase();
      const isTyping = targetTag === 'input' || targetTag === 'textarea';
      if (isTyping) return;

      const mod = e.ctrlKey || e.metaKey;

      // Zoom controls
      if (mod && (e.key === '+' || e.key === '=')) { e.preventDefault(); zoomIn(); return; }
      if (mod && e.key === '-') { e.preventDefault(); zoomOut(); return; }
      if (mod && e.key === '0') { e.preventDefault(); zoomReset(); return; }

      // Scrolling controls
      const fastStep = window.innerHeight * 0.9;
      if (e.key === 'ArrowDown') { e.preventDefault(); scrollViewerBy(120); }
      if (e.key === 'ArrowUp') { e.preventDefault(); scrollViewerBy(-120); }
      if (e.key === 'PageDown') { e.preventDefault(); scrollViewerBy(fastStep); }
      if (e.key === 'PageUp') { e.preventDefault(); scrollViewerBy(-fastStep); }
      if (e.key === ' ') { e.preventDefault(); scrollViewerBy(e.shiftKey ? -fastStep : fastStep); }
      if (e.key === 'Home') { e.preventDefault(); scrollViewerTo(0); }
      if (e.key === 'End') {
        e.preventDefault();
        scrollViewerTo('bottom');
      }

      // Cancel auto-scroll
      if (e.key === 'Escape' && autoScrollActive) {
        stopAutoScroll();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomIn, zoomOut, zoomReset, scrollViewerBy, scrollViewerTo, autoScrollActive, stopAutoScroll]);

  const handleDownload = useCallback(async () => {
    if (!isAuthenticated) return alert('Please login to download.');
    if (!canDownload) return alert(`Upload ${3 - uploads} more document(s) to unlock downloads.`);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/resource/download/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return alert(data.message || 'Download failed');
      }
      const cd = res.headers.get('Content-Disposition');
      let filename = resource?.fileName || `resource-${id}`;
      if (cd) {
        const m = cd.match(/filename="?(.+?)"?$/i);
        if (m?.[1]) filename = m[1];
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Error downloading file.');
    }
  }, [id, isAuthenticated, canDownload, uploads, resource]);

  // Mouse / touchpad zoom (pinch-to-zoom triggers wheel+ctrl)
  useEffect(() => {
    const el = viewerShellRef.current || window;
    const onWheel = e => {
      if (!isPdf) return;
      if (e.ctrlKey) {
        e.preventDefault();
        const direction = Math.sign(e.deltaY);
        if (direction > 0) zoomOut(); else zoomIn();
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isPdf, zoomIn, zoomOut]);

  // Keep zoom inside PDF.js without altering iframe URL (avoids history spam on back button)
  useEffect(() => {
    if (!isPdf) return;
    postToViewer({ type: 'setZoom', zoom: zoom / 100 });
  }, [isPdf, zoom, postToViewer]);

  // Double-click zoom and middle-click auto-scroll
  useEffect(() => {
    const shell = viewerShellRef.current;
    if (!shell) return;

    const onDblClick = e => {
      if (!isPdf) return;
      e.preventDefault();
      if (e.ctrlKey) zoomOut(); else zoomIn();
    };

    const onAuxClick = e => {
      if (e.button === 1) {
        e.preventDefault();
        toggleAutoScroll(e);
      }
    };

    shell.addEventListener('dblclick', onDblClick);
    shell.addEventListener('auxclick', onAuxClick);
    return () => {
      shell.removeEventListener('dblclick', onDblClick);
      shell.removeEventListener('auxclick', onAuxClick);
    };
  }, [isPdf, zoomIn, zoomOut, toggleAutoScroll]);

  useEffect(() => {
    if (!autoScrollActive) return undefined;

    const onMove = e => {
      autoScrollDeltaRef.current = { y: e.clientY - autoScrollAnchor.y };
    };

    const onUp = () => stopAutoScroll();

    const onLeave = () => stopAutoScroll();

    const onKeyEsc = e => { if (e.key === 'Escape') stopAutoScroll(); };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('keydown', onKeyEsc);

    autoScrollTimerRef.current = setInterval(() => {
      const speedY = autoScrollDeltaRef.current.y * 0.6;
      if (Math.abs(speedY) < 2) return;
      scrollViewerBy(speedY);
    }, 16);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('keydown', onKeyEsc);
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
        autoScrollTimerRef.current = null;
      }
    };
  }, [autoScrollActive, autoScrollAnchor, scrollViewerBy, stopAutoScroll]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Top bar (no back button) */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow">
        <div className="font-semibold text-gray-900 truncate max-w-[60vw]">
          {resource?.title || 'Opening...'}
          {shouldShowPreview && isPdf && (
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Preview Only (First 5 Pages)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50"
            title="Download"
          >
            <span className="material-icons-outlined text-gray-700">download</span>
          </button>
        </div>
      </div>

      {/* Preview Notice Banner */}
      {shouldShowPreview && isPdf && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="material-icons-outlined text-yellow-600">info</span>
              <p className="text-sm text-yellow-800">
                {!isAuthenticated ? (
                  <span>
                    <strong>Preview Mode:</strong> You're viewing the first 5 pages only. 
                    <strong> Login</strong> and <strong>upload 3 documents</strong> to access full documents.
                  </span>
                ) : (
                  <span>
                    <strong>Preview Mode:</strong> Upload {3 - uploads} more document{3 - uploads > 1 ? 's' : ''} to unlock full document access and downloads.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Viewer */}
      <div
        ref={viewerShellRef}
        className="relative flex-1 overflow-hidden bg-gray-900"
        style={{ touchAction: 'pan-y pinch-zoom' }}
        onPointerDown={() => viewerFrameRef.current?.focus?.()}
      >
        {loading ? (
          <div className="h-full w-full flex items-center justify-center text-gray-200">Loading document...</div>
        ) : error ? (
          <div className="h-full w-full flex items-center justify-center text-red-400">{error}</div>
        ) : !viewerUrl ? (
          <div className="h-full w-full flex items-center justify-center text-gray-200">No file URL</div>
        ) : isPdf ? (
          <iframe
            ref={viewerFrameRef}
            title="PDF"
            src={viewerUrl}
            className="h-full w-full"
            style={{ border: 'none', touchAction: 'pan-y pinch-zoom' }}
            scrolling="yes"
            tabIndex={0}
            onLoad={() => {
              postToViewer({ type: 'setZoom', zoom: zoom / 100 });
            }}
          />
        ) : (
          <iframe
            ref={viewerFrameRef}
            title="Document"
            src={`${FILE_ORIGIN}${resource.fileUrl}`}
            className="h-full w-full"
            style={{ border: 'none', touchAction: 'pan-y pinch-zoom' }}
            scrolling="yes"
            tabIndex={0}
          />
        )}

        {/* Bottom-right zoom controls (for PDFs) */}
        {isPdf && (
          <div className="absolute bottom-6 right-6">
            <div className="flex items-center gap-2 rounded-full bg-white/90 p-2 shadow">
              <button onClick={zoomOut} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50" title="Zoom out (Ctrl -)">
                <span className="material-icons-outlined text-gray-700">remove</span>
              </button>
              <div className="min-w-[60px] text-center text-sm font-medium text-gray-700">{zoom}%</div>
              <button onClick={zoomIn} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50" title="Zoom in (Ctrl +)">
                <span className="material-icons-outlined text-gray-700">add</span>
              </button>
            </div>
          </div>
        )}

        {/* Auto-scroll indicator */}
        {autoScrollActive && (
          <div
            className="pointer-events-none absolute z-20 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-indigo-400 bg-white/90 shadow"
            style={{ left: autoScrollAnchor.x, top: autoScrollAnchor.y }}
          >
            <div className="absolute inset-2 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-semibold">
              Auto
            </div>
          </div>
        )}

        {/* Shortcut hint */}
        <div className="pointer-events-none absolute left-4 bottom-4 text-xs text-white/70 space-y-1">
          <div className="bg-black/40 backdrop-blur rounded px-3 py-2 shadow">
            <div className="font-semibold text-white">Shortcuts</div>
            <div>Zoom: Ctrl + / Ctrl - / 0</div>
            <div>Scroll: arrows, PgUp/PgDn, Space/Shift+Space</div>
            <div>Auto-scroll: Middle click to toggle, Esc to exit</div>
            <div>Double-click: Zoom in (Ctrl+Double-click to zoom out)</div>
            <div>Pinch: Trackpad pinch to zoom</div>
          </div>
        </div>
      </div>
    </div>
  );
}