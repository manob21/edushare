import React, { useEffect, useMemo, useState, useCallback } from 'react';
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

  const canDownload = uploads >= 3;
  const isPdf = resource && ext(resource.fileName) === 'pdf';

  const viewerUrl = useMemo(() => {
    if (!resource) return null;
    const isPdf = resource.fileName?.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      const file = `${FILE_ORIGIN}/api/resource/view/${id}`;
      return `/pdf-viewer/index.html?file=${encodeURIComponent(file)}#zoom=${zoom}`;
    }
    return resource.fileUrl ? `${FILE_ORIGIN}${resource.fileUrl}` : null;
  }, [resource, id, zoom]);

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

  useEffect(() => {
    const onKey = e => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomIn(); }
      if (e.key === '-') { e.preventDefault(); zoomOut(); }
      if (e.key === '0') { e.preventDefault(); zoomReset(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomIn, zoomOut, zoomReset]);

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

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Top bar (no back button) */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow">
        <div className="font-semibold text-gray-900 truncate max-w-[60vw]">
          {resource?.title || 'Opening...'}
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

      {/* Viewer */}
      <div className="relative flex-1 overflow-hidden bg-gray-900">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center text-gray-200">Loading document...</div>
        ) : error ? (
          <div className="h-full w-full flex items-center justify-center text-red-400">{error}</div>
        ) : !viewerUrl ? (
          <div className="h-full w-full flex items-center justify-center text-gray-200">No file URL</div>
        ) : isPdf ? (
          <iframe title="PDF" src={viewerUrl} className="h-full w-full" style={{ border: 'none' }} />
        ) : (
          <iframe title="Document" src={`${FILE_ORIGIN}${resource.fileUrl}`} className="h-full w-full" style={{ border: 'none' }} />
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
      </div>
    </div>
  );
}