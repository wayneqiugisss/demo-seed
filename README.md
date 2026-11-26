# demo-seed

行业 / 品牌驱动的 eXb2b 后台演示数据初始化 Skill（Qoder Agent Skill）。

把「行业 + 品牌 + 装修风格」翻译成一套彼此引用成立的后台数据，驱动浏览器在演示后台完成 23 步录入与审核，最终产出：客户主数据 → 注册客户与认证审核 → 商品主数据 → 10+ 在售商品 → PC 首页与全局装修。

## 目录结构

| 文件 | 用途 |
|---|---|
| `SKILL.md` | Skill 主入口：定位、铁律、输入采集、五阶段流程与验收 |
| `references/input-and-assets.md` | 六项输入、四种装修风格定义、出图清单与提示词、调研方法 |
| `references/login-and-browser.md` | 登录、滑块、首登改密、浏览器操作与排错 |
| `references/page-playbook.md` | 1–18 步逐页字段与操作步骤 |
| `references/decoration-playbook.md` | 19–23 步装修设计器操作与文案改写清单 |
| `references/dataset-blueprint.md` | dataset.json 结构、命名规则、一致性校验口径 |
| `scripts/validate_dataset.cjs` | 数据集静态校验（引用完整性、数量、必填） |

## 安装

复制到 Qoder skill 目录并重载：

```bash
cp -r . ~/.qoder/skills/demo-seed        # 用户级
# 或项目级：<project>/.qoder/skills/demo-seed
```

随后 `/skills reload`，用 `/demo-seed` 触发。

## 使用

触发后按提示一次性提供：账号、密码、租户号、行业、品牌，再单选装修风格（A 全幅实景轮播 / B 左右分栏杂志 / C 网格拼贴多品 / D 极简留白特写）。

凭据仅存在于对话内存，不写入任何文件、截图或日志。