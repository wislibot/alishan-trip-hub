import type { Settings, TripData } from '../types';

export const fetchTripData = async (settings: Settings): Promise<{ data: TripData, sha: string }> => {
  const { owner, repo, branch, filePath, githubToken } = settings;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const result = await response.json();
  const content = decodeURIComponent(escape(atob(result.content)));
  const data: TripData = JSON.parse(content);
  
  return { data, sha: result.sha };
};

export const updateTripData = async (settings: Settings, data: TripData, sha: string): Promise<{ newSha: string }> => {
  const { owner, repo, branch, filePath, githubToken } = settings;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Update trip plan via Trip Hub',
      content,
      sha,
      branch
    })
  });

  if (response.status === 409) {
    throw new Error('CONFLICT');
  }

  if (!response.ok) {
    throw new Error(`Failed to update: ${response.statusText}`);
  }

  const result = await response.json();
  return { newSha: result.content.sha };
};
