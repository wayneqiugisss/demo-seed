# 数据蓝图（dataset.json）

`dataset.json` 是造数的唯一事实来源：先写全，再校验，最后照着填。执行过程中的实际 ID 不写回本文件，只记 `ledger.md`。

## 1. 结构

> 下面是**结构示例**（只放了 1 个商品、1 条品类），用于说明字段；实际文件必须按 §2 数量下限补齐后再跑校验。

```json
{
  "meta": {
    "tenantCode": "租户号",
    "industry": "乳制品",
    "brand": "示例品牌",
    "brandEn": "DEMO",
    "primaryColor": "#C8102E",
    "accentColor": "#F6E7D8",
    "bannerStyle": "A",
    "bannerStyleNote": "",
    "siteNameZh": "示例品牌",
    "siteNameEn": "DEMO B2B",
    "subtitle": "示例品牌 乳制品 官方订货平台",
    "slogan": "品牌直供 · 整箱批发 · 区域授权",
    "research": {
      "positioning": "大众快消",
      "productLines": ["常温奶", "低温奶", "礼盒"],
      "channels": ["经销商", "连锁商超", "区域代理"],
      "fallback": false
    }
  },
  "scopes": [
    { "group": "常温乳品", "name": "常温纯牛奶", "code": "SC-CW-01" }
  ],
  "customerTagCategories": [{ "name": "客户价值" }],
  "customerTags": [
    { "category": "客户价值", "name": "高复购", "color": "#C8102E" }
  ],
  "customerAreas": [
    { "parent": "", "name": "华东", "code": "EAST" },
    { "parent": "华东", "name": "浙江", "code": "ZJ" }
  ],
  "customerTypes": [{ "name": "经销商" }],
  "customerLevels": [{ "name": "金牌", "value": 3 }],
  "customerIndustries": [{ "group": "食品饮料", "name": "乳制品" }],
  "customers": [
    {
      "custName": "杭州云牧贸易有限公司",
      "contact": "张伟",
      "phone": "13800001001",
      "creditCode": "91330100MA2DEMO001",
      "email": "zhang@example.com",
      "type": "经销商",
      "level": "金牌",
      "industry": "乳制品",
      "region": ["浙江省", "杭州市", "西湖区"],
      "bizAreas": ["浙江省/杭州市"],
      "scope": "常温纯牛奶",
      "creditAmount": 0
    }
  ],
  "catalogs": [
    {
      "path": ["乳品", "常温奶", "纯牛奶"],
      "brand": "示例品牌",
      "image": "cat-milk.png",
      "attributes": [{ "name": "净含量", "type": "文本" }]
    }
  ],
  "series": [{ "name": "经典系列" }],
  "taxes": [{ "name": "标准税率", "rate": 13 }],
  "brands": [{ "name": "示例品牌", "logo": "logo-brand.png" }],
  "productTagCategories": [{ "name": "营销标签" }],
  "productTags": [{ "category": "营销标签", "name": "热销" }],
  "labelGroups": [{ "name": "包装形式" }],
  "labels": [{ "group": "包装形式", "name": "整箱装" }],
  "units": [
    { "name": "箱", "type": "包装单位", "symbol": "CTN" },
    { "name": "盒", "type": "基础单位", "symbol": "BOX" }
  ],
  "freightTemplates": [
    {
      "name": "全国整箱配送",
      "senderProvince": "浙江省",
      "senderCity": "杭州市",
      "pricingType": "按件数",
      "defaultFee": 15,
      "default": true
    }
  ],
  "products": [
    {
      "title": "示例品牌 经典 纯牛奶 250ml×12盒",
      "subtitle": "整箱直供，区域授权",
      "catalogPath": ["乳品", "常温奶", "纯牛奶"],
      "brand": "示例品牌",
      "series": "经典系列",
      "scope": "常温纯牛奶",
      "tags": ["热销"],
      "labels": ["整箱装"],
      "attributes": { "净含量": "250ml×12" },
      "unit": "箱",
      "marketPrice": 129,
      "price": 99,
      "middlePack": 12,
      "moq": 1,
      "weight": 3000,
      "barcode": "6900000000001",
      "tax": "标准税率",
      "freightTemplate": "全国整箱配送",
      "saleStatus": "可售",
      "visibleStatus": "可见",
      "images": {
        "main": ["product-demo-classic-milk-main.png"],
        "detail": ["product-demo-classic-milk-detail.png"]
      },
      "description": [
        { "title": "产品亮点", "body": "整箱规格，适合门店陈列与团购配送。" }
      ]
    }
  ],
  "decoration": {
    "pcPageName": "示例品牌商城首页",
    "banners": ["banner-01.png", "banner-02.png", "banner-03.png"],
    "floorTheme": {
      "image": "floor-theme.png",
      "title": "常温乳品精选",
      "subtitle": "每日配送，区域授权",
      "linkText": "查看全部"
    },
    "floorSplit": {
      "leftImage": "floor-split-left.png",
      "rightImage": "floor-split-right.png",
      "title": "礼赠与团购场景",
      "subtitle": "整箱组合，按需配货",
      "leftLinkText": "礼盒专区",
      "rightLinkText": "团购专区"
    },
    "productCard": {
      "title": "示例品牌热销榜",
      "subtitle": "按上架热度每日更新",
      "conditionBrand": "示例品牌",
      "count": 10
    },
    "productBlock": {
      "title": "按场景选购",
      "subtitle": "两个主推场景",
      "blocks": [
        { "title": "早餐场景", "subtitle": "常温纯牛奶", "color": "#C8102E" },
        { "title": "礼赠场景", "subtitle": "礼盒组合", "color": "#F6E7D8" }
      ]
    },
    "categoryMenu": [
      { "name": "纯牛奶", "icon": "cat-milk.png", "link": "/category/all" },
      { "name": "酸奶", "icon": "cat-yogurt.png", "link": "/category/all" },
      { "name": "礼盒", "icon": "cat-gift.png", "link": "/category/all" },
      { "name": "新品", "icon": "cat-new.png", "link": "/category/all" }
    ]
  }
}
```

## 2. 数量下限

| 对象 | 下限 |
|---|---|
| 经营范围 | 分类 2 + 范围 6 |
| 客户标签 | 分类 2 + 标签 6 |
| 客户区域 | 一级 1 + 二级 3 |
| 客户类型 / 等级 / 行业 | 2 / 3 / 2 |
| 客户 | 3 |
| 商品品类 | 一级 1 + 二级 2 + 末级 4 |
| 系列 / 税率 / 品牌 | 2 / 1 / 1 |
| 商品标签 / 吊牌 / 单位 | 4 / 3 / 3 |
| 运费模板 | 1 |
| 商品 | **12 个候选，至少 10 个成功** |
| 分类菜单项 | 4–6 |

## 3. 命名规则

| 对象 | 规则 |
|---|---|
| 商品标题 | `品牌 + 系列 + 品名 + 规格`，≤60 字，全局唯一 |
| 客户公司 | `区域 + 字号 + 行业 + 有限公司/商行`，3 家分布在 2–3 个省份 |
| 信用代码 | 18 位、`91` 开头、字母数字混合，虚构且唯一 |
| 手机号 | `1380000xxxx` 段，虚构且唯一 |
| 条码 | 13 位数字，`690` 开头，虚构且唯一 |
| 价格 | 箱价；划线价 ≥ 基准价；基准价 > 0 |
| 标签分工 | 客户标签描述客户价值/合作方式；商品标签描述营销属性，两套不混用 |
| 经营范围 | 同时供商品表单与客户审核使用，命名要能覆盖两者 |

## 4. 引用一致性

| 引用方 | 被引用 | 约束 |
|---|---|---|
| 商品 | 品类末级 | `catalogPath` 必须命中 `catalogs[].path`，且该末级绑定本次品牌 |
| 商品 | 品牌 / 系列 / 经营范围 / 标签 / 吊牌 / 单位 / 税率 / 运费模板 | 必须分别存在于对应数组 |
| 客户认证 | 客户类型 / 等级 / 行业 | 名称必须存在 |
| 客户审核 | 客户等级 / 经营范围 / 授权地区 | 等级与范围必须存在；授权地区与客户所在省一致 |
| 客户标签 / 商品标签 | 分类 | `category` 必须存在 |
| 吊牌 | 分组 | `group` 必须存在 |
| 客户区域 | 上级区域 | `parent` 为空或已存在；层级 ≤5 |
| 分类菜单 | 商品品类 | 名称取一级/二级品类 |

## 5. LEDGER

`ledger.md` 记录实际执行，不参与校验：

```
| 步骤 | 页面 | 对象 | 计划数 | 成功数 | 状态 | 备注 |
| 1 | scopes | 经营范围 | 8 | 8 | done | 3 个分类 |
| 17 | products | 商品 | 12 | 10 | done | 2 个因图片重传延后 |
```

状态枚举：`done / partial / exists / blocked / skipped`。备注里只写业务原因，不写凭据。
