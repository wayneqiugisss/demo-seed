# 输入与出图规范

## 1. 六项输入

| 输入 | 必填 | 用途 | 缺失时 |
|---|---|---|---|
| 账号 | 是 | 登录用户名 | 必须问 |
| 密码 | 是 | 登录密码 | 必须问 |
| 租户号 | 是 | 登录页「租户编码」 | 必须问 |
| 行业 | 是 | 客户行业、品类、经营范围和全部文案 | 必须问 |
| 品牌 | 是 | 品牌名、LOGO、商品标题、站点名 | 必须问 |
| 装修风格 | 是 | A/B/C/D 或 Other 描述 | 用 AskUserQuestion 选 |

以下字段**由品牌/行业派生，不再追问**（用户额外提供时优先）：

| 字段 | 派生规则 |
|---|---|
| 站点中文名 | `<品牌>` 或 `<品牌>商城` |
| 站点英文名 | 品牌英文名；无则大写拼音/首字母 + `B2B` |
| 副标题 | `<品牌> <行业> 官方订货平台` |
| 主标语 | 8–16 字，突出渠道与正品，如「品牌直供 · 整箱批发 · 区域授权」 |
| 品牌主色 | 检索品牌视觉；检索不到则按行业选：食品饮料橙红、美妆粉金、家居木色、3C 深蓝、医药蓝白 |
| 辅助色 | 主色的低饱和邻近色 |

## 2. 四种装修风格

风格只约束**图片形态**与**全局版式**，不改变数据口径。

| 选项 | banner 形态 | 构图要点 | 图片尺寸 | 全局样式映射 |
|---|---|---|---|---|
| A 全幅实景轮播 | 3 张通栏大图轮播，高 460px | 实景场景（货架/餐桌/门店/仓储），主体偏一侧，另一侧留白给标语；画面大气 | 1792×1024 | 版式「企业门户」或「清晰易读」；明暗=日间；色调=云白·企业蓝 |
| B 左右分栏杂志 | 3 张，每张左文右图或图左文右 | 一侧产品特写 + 一侧大面积纯色/纹理留白；画册质感，低饱和 | 1792×1024 | 版式「品牌年鉴」或「权威商务」；日间；色调=石墨·中性黑 或 赭石·陶土 |
| C 网格拼贴多品 | 3 张，每张 2×2 或三联拼贴 | 同场景多 SKU/多口味组合，信息密度高；边缘对齐，留 24px 间隙 | 1792×1024 | 版式「瑞士现代」或「卡片模块」；日间；色调=海蓝·青碧 或 青柠·荧光绿 |
| D 极简留白特写 | 3 张，单品居中大特写 | 纯色/微渐变背景，主体占 55–70%，硬光或柔光单光源，强促销感 | 1792×1024 | 版式「科技玻璃」或「极简网格」；日间；色调=云白·企业蓝 或 赛博·霓虹 |

Other 处理：按描述归到最接近的一档，并在 `dataset.json.meta.bannerStyleNote` 记录原始描述；全局版式仍按归属档映射。

## 3. 调研

执行 2–4 条检索并落成 `dataset.json.meta.research`：

1. `<品牌> 产品中心 / 热销产品 / 包装规格`
2. `<品牌> <行业> 品牌定位 主色`
3. `<行业> 经销商 渠道结构 客户类型`
4. `<行业> 产品包装 常见形态`

需要提炼的字段：

| 字段 | 示例 |
|---|---|
| 品牌定位 | 大众快消 / 中高端礼赠 / 专业渠道 |
| 主色与辅助色 | #C8102E / #F6E7D8 |
| 产品线 | 3–5 条，对应商品一级/二级品类 |
| 单品与规格 | 12 个，含包装形态、净含量、箱规 |
| 价格带 | 基准价与划线价区间 |
| 渠道与客户 | 经销商 / 连锁商超 / 区域代理 / 电商 |

若检索不到（虚构品牌、行业过窄）：按行业通用产品线构造，在 `meta.research.fallback=true` 标注，并在收尾汇报中说明。

## 4. 图片清单

所有图片输出到 `_demo_seed/run-xxx/images/`，命名固定，`dataset.json` 引用相对文件名。

| 用途 | 数量 | 尺寸 | 命名 |
|---|---|---|---|
| 首页轮播 | 3 | 1792×1024 | `banner-01.png` … |
| 主题楼层左图 | 1 | 1536×1024 | `floor-theme.png` |
| 分块楼层左右图 | 2 | 1024×1024 | `floor-split-left.png`、`floor-split-right.png` |
| 分类图标/类目图 | 4–6 | 1024×1024 | `cat-<slug>.png` |
| 品牌 LOGO | 1 | 1024×1024 | `logo-brand.png` |
| 站点 LOGO | 1 | 1024×1024 | `logo-site.png`（可与品牌 LOGO 同图复制） |
| 商品主图 | 每商品 1 | 1024×1024 | `product-<slug>-main.png` |
| 商品细节/场景图 | 每商品 1 | 1024×1024 | `product-<slug>-detail.png` |

数量控制：商品 12 个时共约 24 张商品图；总图量约 35 张。先出商品图，再出装修图，最后 LOGO/图标。

## 5. 提示词模板

所有提示词追加统一负面约束：`no text, no letters, no logo, no watermark, no illustration, no 3D render`。包装上只允许纯色块与几何图形。

### 商品主图（实景实物）

```
Photorealistic commercial product photograph of <产品名 + 包装形态 + 净含量>,
<品牌主色> packaging with blank label area, on a clean <白/浅灰/木纹> surface,
soft studio lighting, subtle shadow, 50mm lens, f/8, ultra sharp, true-to-life colors,
centered composition, square 1:1, no text, no logo, no watermark, not a 3D render
```

### 商品细节/场景图（实景使用场景）

```
Photorealistic lifestyle photograph of <产品> in <场景：餐桌/货架/厨房/门店/仓储>,
<搭配道具 1–2 件>, natural window light, shallow depth of field, realistic materials and texture,
brand color accents only, no text, no logo, no watermark, not an illustration
```

### 首页轮播（按风格）

- A：`Photorealistic wide-angle hero photograph, <products> arranged in <real scene>, large negative space on the left for headline, cinematic daylight, wide 16:9, brand color <主色> accents, no text, no logo`
- B：`Editorial split-layout hero photograph, <product close-up> on the right, large flat <主色/中性色> surface on the left, soft gradient light, magazine aesthetic, wide 16:9, no text, no logo`
- C：`Top-down grid collage photograph of <4–6 SKUs> on a <background>, aligned edges, generous gaps, bright even light, high information density, wide 16:9, no text, no logo`
- D：`Minimalist product hero, single <product> centered on a seamless <纯色/微渐变> background, dramatic soft single-source light, 60% frame coverage, wide 16:9, no text, no logo`

### 楼层图 / 分类图

```
Photorealistic <品类场景> image for a B2B storefront, <主色> accents, clean composition,
no text, no logo, square
```

### LOGO

```
Minimal flat vector logo mark for a <行业> brand, abstract <几何母题>, <主色> on solid white,
centered with generous padding, crisp edges, no text, no letters, no watermark
```

> 中文品牌名不放进图片。页头文字、站点名、标语一律走文字组件/全局样式字段。

## 6. 出图验收

逐张检查，不合格重生成：

1. 无任何文字、字母、水印、可识别真实品牌 LOGO。
2. 商品图是真实摄影质感，不是插画/3D 渲染；包装不变形、不出现乱码图案。
3. 同一批图光源方向、色温、背景一致；主色与品牌色一致。
4. 轮播图主体不居中遮挡文字区，左右留白足够。
5. 文件为 PNG/JPG；若上传报「文件过大」，重新生成或压缩到 2MB 以内。

## 7. 上传注意

- 商品主图与详情图分别上传到「图文信息」的主图与商品详情位。
- 品牌 LOGO、站点 LOGO、分类图、分类菜单图标分别上传到各自字段，不复用错位。
- 上传后必须等缩略图回显，再点保存。
