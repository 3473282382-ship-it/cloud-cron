# cloud-cron · 云端定时任务

电脑关机也能在固定时间自动干活。跑在 GitHub 的免费服务器上，不花钱、不占你电脑。

## 它能干什么

到了设定的时间，GitHub 会自动开一台临时机器，把你 `scripts/task.mjs` 里的代码跑一遍，跑完关机。
所以你可以拿它做：定时抓数据、检查网站是否宕机、生成日报、整理文件、发通知等等。

注意：它跑的是**你写的脚本**，不是「我」本人。有明确规则、能写成代码的事，它都能替你干；需要临场判断、要看屏幕操作软件的活儿，它做不到。

## 改任务内容

打开 `scripts/task.mjs`，只改 `runTask()` 那一段就行：

```js
async function runTask() {
  const lines = [];
  // 你的逻辑写在这里
  return lines.join('\n');
}
```

返回值会写进日志、也会推到微信。

## 改执行时间

打开 `.github/workflows/daily-task.yml`，改 `cron` 那行。**cron 是 UTC 时间，北京时间要减 8 小时**：

| 想跑的时间（北京） | cron 写法 |
|---|---|
| 每天早上 8 点 | `0 0 * * *` |
| 每天中午 12 点 | `0 4 * * *` |
| 每天晚上 22 点 | `0 14 * * *` |
| 每小时整点 | `0 * * * *` |
| 每周一早上 9 点 | `0 1 * * 1` |

## 微信推送（可选，但推荐）

1. 打开 https://www.pushplus.plus ，微信扫码登录
2. 首页「一对一推送」里复制你的 token
3. 在 GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret
4. Name 填 `PUSHPLUS_TOKEN`，Secret 填刚才复制的 token

不配也能跑，只是不推送，结果只能上 GitHub 看日志。

## 怎么确认它在跑

仓库页面 → Actions → 点 `daily-task` → 能看到每次运行记录。
也可以点 `Run workflow` 按钮立刻手动跑一次测试。

## 两个坑要知道

- **仓库必须是 Public**，免费额度才不限时长（Private 仓库每月 2000 分钟，一般也够，但 Public 更省心）。
- **连续 60 天没有新提交，定时任务会被 GitHub 自动停掉**。偶尔改一下代码或点一次手动运行就能续上。
- 定时并不精确，整点任务常会晚 5~15 分钟，这是 GitHub 免费服务的常态，别拿来做秒级精确的事。
