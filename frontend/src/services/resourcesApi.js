const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const resourcesApi = {
  async getAll() {
    const r = await fetch(`${API_URL}/resource/all`);
    const j = await r.json();
    if (!j.success) throw new Error('Failed to fetch all');
    return j.resources;
  },
  async getPopular() {
    const r = await fetch(`${API_URL}/resource/popular`);
    const j = await r.json();
    if (!j.success) throw new Error('Failed to fetch popular');
    return j.resources;
  },
  async getBySubject(subject) {
    const r = await fetch(`${API_URL}/resource/subject/${encodeURIComponent(subject)}`);
    const j = await r.json();
    if (!j.success) throw new Error('Failed to fetch by subject');
    return j.resources;
  },
  async myUploads(token) {
    const r = await fetch(`${API_URL}/resource/my-uploads`, { headers: { Authorization: `Bearer ${token}` } });
    const j = await r.json();
    if (!j.success) throw new Error('Failed to fetch uploads');
    return j.resources;
  },
  async myDownloads(token) {
    const r = await fetch(`${API_URL}/resource/my-downloads`, { headers: { Authorization: `Bearer ${token}` } });
    const j = await r.json();
    if (!j.success) throw new Error('Failed to fetch downloads');
    return j.resources;
  },
  async upload(formData, token) {
    const r = await fetch(`${API_URL}/resource/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.message || 'Upload failed');
    return j;
  },
};