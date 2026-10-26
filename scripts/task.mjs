// 每天自动执行的任务脚本
// 这里写什么，云端就每天干什么。改完推送到 GitHub 立即生效。
//
// 依赖：Node 18+ 内置 fetch，无需 npm install

import fs from 'node:fs';

const OUT_DIR = 'out';

/** ============ 1. 这里是你的实际任务，改这一段 ============ */
async function runTask() {
  const lines = [];
  lines.push(`运行时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);

  // 示例 A：检查几个网址是否能打开（可以换成你的博客、接口、商店页面）
  const urls = [
    'https://www.baidu.com',
    // 'https://你的网站.com',
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
      lines.push(`✅ ${url} → HTTP ${res.status}`);
    } catch (e) {
      lines.push(`❌ ${url} → 打不开（${e.name}）`);
    }
  }

  // 示例 B：把这里换成任意逻辑——读接口、算数据、生成文本、写文件都行
  // 比如定时整理你的小说章节字数：
  // lines.push(`当前章节数：${fs.readdirSync('chapters').length}`);

  return lines.join('\n');
}

/** ============ 2. 微信推送（PushPlus，免费） ============ */
async function pushWechat(title, content) {
  const token = process.env.PUSHPLUS_TOKEN;
  if (!token) {
    console.log('[跳过推送] 未配置 PUSHPLUS_TOKEN');
    return;
  }
  const res = await fetch('https://www.pushplus.plus/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, title, content, template: 'txt' }),
  });
  const data = await res.json().catch(() => ({}));
  console.log('[微信推送]', data.code === 200 ? '成功' : `失败：${JSON.stringify(data)}`);
}

/** ============ 3. 主流程 ============ */
const started = Date.now();
let body;
let ok = true;
try {
  body = await runTask();
} catch (e) {
  ok = false;
  body = `任务出错：${e.stack || e.message}`;
}

const cost = ((Date.now() - started) / 1000).toFixed(1);
console.log(body);

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(`${OUT_DIR}/log.txt`, `${body}\n耗时 ${cost}s\n`);

await pushWechat(ok ? '每日任务完成' : '每日任务失败', `${body}\n\n耗时 ${cost}s`);
if (!ok) process.exit(1);
