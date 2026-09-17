/**
 * Service สร้าง Commit ผ่าน GitHub REST API เพื่อบันทึก Contribution ให้บัญชี GitHub
 * ทำงานแบบ Fire-and-forget / Non-blocking ไม่กระทบการทำงานหลักของเว็บ
 */

interface CommitEventOptions {
  action: 'create' | 'update' | 'delete' | 'reorder';
  tableName: string;
  detail?: string;
}

export async function triggerGitHubContribution(options: CommitEventOptions): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || 'suchakree-panyawong';
  const repo = process.env.GITHUB_REPO || 'suchakree-portfolio';
  const committerName = process.env.GITHUB_USER_NAME || 'Suchakree Panyawong';
  const committerEmail = process.env.GITHUB_USER_EMAIL || 'suchakree-panyawong@users.noreply.github.com';

  if (!token) {
    return; // ถ้าไม่มี token ให้ข้ามเงียบๆ ไม่กระทบระบบ
  }

  try {
    const filePath = 'content-sync.json';
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    // 1. ตรวจสอบว่ามีไฟล์อยู่เดิมหรือไม่เพื่อเอา SHA
    let existingSha: string | undefined;
    try {
      const getRes = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'portfolio-sync',
        },
        cache: 'no-store',
      });
      if (getRes.ok) {
        const body = (await getRes.json()) as { sha?: string };
        existingSha = body.sha;
      }
    } catch {
      // ignore
    }

    const payloadContent = {
      lastUpdated: new Date().toISOString(),
      action: options.action,
      table: options.tableName,
      detail: options.detail || 'Content updated via Dashboard',
    };

    const commitMessage = `cms(${options.tableName}): ${options.action} [activity]`;
    const base64Content = Buffer.from(JSON.stringify(payloadContent, null, 2)).toString('base64');

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'portfolio-sync',
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        sha: existingSha,
        committer: {
          name: committerName,
          email: committerEmail,
        },
        author: {
          name: committerName,
          email: committerEmail,
        },
      }),
    });

    if (!putRes.ok) {
      console.warn('GitHub contribution commit warning:', await putRes.text());
    }
  } catch (error) {
    console.warn('GitHub contribution commit error (non-fatal):', error);
  }
}
