#!/usr/bin/env node
/**
 * dataset.json 静态校验：结构、数量下限、引用完整性、图片存在性（可选）。
 * 用法: node validate_dataset.cjs <dataset.json> [--images]
 * 退出码: 0 = PASS, 1 = FAIL, 2 = 用法/读取错误
 */
const fs = require('fs')
const path = require('path')

const file = process.argv[2]
const checkImages = process.argv.includes('--images')
if (!file) {
	console.error('Usage: node validate_dataset.cjs <dataset.json> [--images]')
	process.exit(2)
}

const abs = path.resolve(file)
const dir = path.dirname(abs)
let data
try {
	data = JSON.parse(fs.readFileSync(abs, 'utf8'))
} catch (e) {
	console.error(`读取或解析失败: ${e.message}`)
	process.exit(2)
}

const errors = []
const warnings = []
const err = m => errors.push(m)
const warn = m => warnings.push(m)
const isStr = v => typeof v === 'string' && v.trim() !== ''
const isNum = v => typeof v === 'number' && Number.isFinite(v)
const arr = v => (Array.isArray(v) ? v : [])
const nameOf = v => (v && typeof v === 'object' ? v.name : v)

const meta = data.meta || {}
const metaRequired = ['tenantCode', 'industry', 'brand', 'bannerStyle', 'siteNameZh', 'siteNameEn', 'subtitle', 'slogan']
for (const k of metaRequired) if (!isStr(meta[k])) err(`meta.${k} 缺失或为空`)
if (isStr(meta.bannerStyle) && !['A', 'B', 'C', 'D'].includes(meta.bannerStyle)) {
	err(`meta.bannerStyle 只能是 A/B/C/D，当前: ${meta.bannerStyle}`)
}
for (const k of ['primaryColor', 'accentColor']) {
	if (meta[k] && !/^#[0-9a-fA-F]{6}$/.test(meta[k])) warn(`meta.${k} 不是 6 位十六进制色值: ${meta[k]}`)
}

// ---------- 基础主数据 ----------
const scopes = arr(data.scopes)
const scopeNames = new Set()
if (scopes.length < 6) warn(`经营范围仅 ${scopes.length} 个，建议 ≥6`)
for (const s of scopes) {
	if (!isStr(s.group)) err('scopes[].group 不能为空')
	if (!isStr(s.name)) err('scopes[].name 不能为空')
	if (scopeNames.has(s.name)) err(`经营范围重复: ${s.name}`)
	scopeNames.add(s.name)
}

const custTagCats = arr(data.customerTagCategories)
const custTagCatNames = new Set(custTagCats.map(c => c.name))
for (const c of custTagCats) if (!isStr(c.name)) err('customerTagCategories[].name 不能为空')
const custTags = arr(data.customerTags)
if (custTags.length < 6) warn(`客户标签仅 ${custTags.length} 个，建议 ≥6`)
for (const t of custTags) {
	if (!isStr(t.name)) err('customerTags[].name 不能为空')
	if (!custTagCatNames.has(t.category)) err(`客户标签「${t.name}」的分类不存在: ${t.category}`)
}

const areas = arr(data.customerAreas)
const areaByName = new Map()
for (const a of areas) {
	if (!isStr(a.name)) err('customerAreas[].name 不能为空')
	if (areaByName.has(a.name)) err(`客户区域重名: ${a.name}`)
	areaByName.set(a.name, a)
}
if (areas.length < 4) warn(`客户区域仅 ${areas.length} 个，建议 1 个一级 + 3 个二级`)
const depthOf = (a, seen = new Set()) => {
	if (!isStr(a.parent)) return 1
	if (seen.has(a.name)) {
		err(`客户区域存在循环引用: ${a.name}`)
		return 99
	}
	seen.add(a.name)
	const parent = areaByName.get(a.parent)
	if (!parent) {
		err(`客户区域「${a.name}」的上级不存在: ${a.parent}`)
		return 1
	}
	return depthOf(parent, seen) + 1
}
for (const a of areas) {
	const d = depthOf(a)
	if (d > 5) err(`客户区域「${a.name}」层级 ${d} 超过 5 级`)
}

const custTypes = arr(data.customerTypes)
if (custTypes.length < 2) warn(`客户类型仅 ${custTypes.length} 个，建议 ≥2`)
for (const t of custTypes) if (!isStr(t.name)) err('customerTypes[].name 不能为空')
const custTypeNames = new Set(custTypes.map(t => t.name))

const levels = arr(data.customerLevels)
const levelNames = new Set()
const levelValues = new Set()
if (levels.length < 3) warn(`客户等级仅 ${levels.length} 个，建议 ≥3`)
for (const l of levels) {
	if (!isStr(l.name)) err('customerLevels[].name 不能为空')
	if (levelNames.has(l.name)) err(`客户等级重名: ${l.name}`)
	levelNames.add(l.name)
	if (l.value !== undefined) {
		if (!isNum(l.value) || l.value < 0 || l.value > 99) err(`客户等级「${l.name}」等级值应为 0–99`)
		else if (levelValues.has(l.value)) err(`客户等级值重复: ${l.value}`)
		else levelValues.add(l.value)
	}
}

const industries = arr(data.customerIndustries)
const industryNames = new Set()
for (const i of industries) {
	if (!isStr(i.group) || !isStr(i.name)) err('customerIndustries[] 需要 group 与 name')
	if (industryNames.has(i.name)) err(`客户行业重名: ${i.name}`)
	industryNames.add(i.name)
}

// ---------- 客户 ----------
const customers = arr(data.customers)
if (customers.length < 1) err('customers 至少需要 1 个')
const phones = new Set()
for (const c of customers) {
	const tag = c.custName || '(未命名客户)'
	for (const k of ['custName', 'contact', 'phone', 'creditCode']) if (!isStr(c[k])) err(`客户「${tag}」缺少 ${k}`)
	if (isStr(c.phone)) {
		if (!/^1[3-9]\d{9}$/.test(c.phone)) err(`客户「${tag}」手机号格式不正确: ${c.phone}`)
		if (phones.has(c.phone)) err(`客户手机号重复: ${c.phone}`)
		phones.add(c.phone)
	}
	if (isStr(c.creditCode) && !/^[A-Za-z0-9]{15,20}$/.test(c.creditCode)) {
		err(`客户「${tag}」信用代码应为 15–20 位字母数字: ${c.creditCode}`)
	}
	if (c.type && !custTypeNames.has(c.type)) err(`客户「${tag}」客户类型不存在: ${c.type}`)
	if (c.level && !levelNames.has(c.level)) err(`客户「${tag}」客户等级不存在: ${c.level}`)
	if (c.industry && !industryNames.has(c.industry)) err(`客户「${tag}」客户行业不存在: ${c.industry}`)
	if (c.scope && !scopeNames.has(c.scope)) err(`客户「${tag}」经营范围不存在: ${c.scope}`)
	if (arr(c.region).length < 1) err(`客户「${tag}」缺少 region（省/市/区）`)
	if (arr(c.bizAreas).length < 1) err(`客户「${tag}」缺少 bizAreas（审核授权地区）`)
	if (c.creditAmount !== undefined && c.creditAmount !== 0 && !isNum(c.creditAmount)) {
		err(`客户「${tag}」creditAmount 应为数字`)
	}
}

// ---------- 商品主数据 ----------
const catalogList = arr(data.catalogs)
const catalogPaths = catalogList.map(c => arr(c.path))
const catalogKey = p => p.join('>')
const catalogSet = new Set(catalogPaths.map(catalogKey))
const brandNames = new Set(arr(data.brands).map(b => b.name))
const seriesNames = new Set(arr(data.series).map(s => s.name))
const taxNames = new Set(arr(data.taxes).map(t => t.name))
const unitNames = new Set(arr(data.units).map(u => u.name))
const ptCats = new Set(arr(data.productTagCategories).map(c => c.name))
const ptNames = new Set(arr(data.productTags).map(t => t.name))
const labelGroups = new Set(arr(data.labelGroups).map(g => g.name))
const labelNames = new Set(arr(data.labels).map(l => l.name))
const freightNames = new Set(arr(data.freightTemplates).map(f => f.name))

if (!brandNames.has(meta.brand)) err(`brands 中缺少本次品牌: ${meta.brand}`)
for (const b of arr(data.brands)) if (!isStr(b.name)) err('brands[].name 不能为空')
for (const s of arr(data.series)) if (!isStr(s.name)) err('series[].name 不能为空')
for (const t of arr(data.taxes)) {
	if (!isStr(t.name)) err('taxes[].name 不能为空')
	if (!isNum(t.rate) || t.rate < 0 || t.rate > 100) err(`税率「${t.name}」应在 0–100 之间`)
}
for (const u of arr(data.units)) {
	if (!isStr(u.name)) err('units[].name 不能为空')
	if (!isStr(u.type)) err(`单位「${u.name}」缺少 type`)
}
for (const c of arr(data.productTagCategories)) if (!isStr(c.name)) err('productTagCategories[].name 不能为空')
for (const t of arr(data.productTags)) {
	if (!isStr(t.name)) err('productTags[].name 不能为空')
	if (!ptCats.has(t.category)) err(`商品标签「${t.name}」的分类不存在: ${t.category}`)
}
for (const g of arr(data.labelGroups)) if (!isStr(g.name)) err('labelGroups[].name 不能为空')
for (const l of arr(data.labels)) {
	if (!isStr(l.name)) err('labels[].name 不能为空')
	if (!labelGroups.has(l.group)) err(`吊牌「${l.name}」的分组不存在: ${l.group}`)
}

const freights = arr(data.freightTemplates)
if (freights.length < 1) err('freightTemplates 至少需要 1 个')
let defaultFreights = 0
for (const f of freights) {
	if (!isStr(f.name)) err('freightTemplates[].name 不能为空')
	if (!isStr(f.senderProvince) || !isStr(f.senderCity)) err(`运费模板「${f.name}」发货地区必须到省/市`)
	if (isStr(f.pricingType) && !/按件数|按重量/.test(f.pricingType)) {
		err(`运费模板「${f.name}」计价方式应为「按件数」或「按重量」: ${f.pricingType}`)
	}
	if (f.defaultFee !== undefined && (!isNum(f.defaultFee) || f.defaultFee < 0)) {
		err(`运费模板「${f.name}」默认运费应 ≥0`)
	}
	if (f.default === true) defaultFreights += 1
}
if (defaultFreights === 0) warn('没有运费模板标记 default=true，列表里需手动设为默认')
if (defaultFreights > 1) err('默认运费模板只能有 1 个')

// 品类：路径层级、父级存在、末级品牌绑定
const isPrefix = (p, full) => p.length <= full.length && p.every((seg, i) => seg === full[i])
const isLeaf = p => !catalogPaths.some(other => other.length > p.length && isPrefix(p, other))
for (const p of catalogPaths) {
	if (p.length === 0) {
		err('catalogs[].path 不能为空')
		continue
	}
	if (p.some(s => !isStr(s))) err(`catalogs 路径存在空段: ${catalogKey(p)}`)
	if (p.length > 3) err(`品类层级超过 3 级: ${catalogKey(p)}`)
	for (let i = 1; i < p.length; i += 1) {
		const prefix = p.slice(0, i)
		if (!catalogSet.has(catalogKey(prefix))) err(`品类父级缺失: ${catalogKey(prefix)}（${catalogKey(p)}）`)
	}
}
if (catalogList.length < 4) warn(`商品品类仅 ${catalogList.length} 个，建议 ≥4 个末级`)
const brandBoundLeaf = catalogList.some(c => isLeaf(arr(c.path)) && c.brand === meta.brand)
if (!brandBoundLeaf) err(`没有任何末级品类绑定本次品牌「${meta.brand}」，商品表单将选不到品牌`)
for (const c of catalogList) {
	if (c.brand && !brandNames.has(c.brand)) err(`品类「${catalogKey(arr(c.path))}」绑定的品牌不存在: ${c.brand}`)
	for (const a of arr(c.attributes)) if (!isStr(a.name)) err(`品类「${catalogKey(arr(c.path))}」存在空属性名`)
}

// ---------- 商品 ----------
const products = arr(data.products)
if (products.length < 10) err(`商品仅 ${products.length} 个，至少需要 10 个`)
else if (products.length < 12) warn(`商品候选 ${products.length} 个，建议 ≥12 以对冲失败`)
const titles = new Set()
const barcodes = new Set()
for (const p of products) {
	const tag = p.title || '(未命名商品)'
	if (!isStr(p.title)) err('products[].title 不能为空')
	else {
		if (p.title.length > 60) err(`商品标题超过 60 字: ${p.title}`)
		if (titles.has(p.title)) err(`商品标题重复: ${p.title}`)
		titles.add(p.title)
	}
	if (!catalogSet.has(catalogKey(arr(p.catalogPath)))) err(`商品「${tag}」品类不存在: ${catalogKey(arr(p.catalogPath))}`)
	else if (!isLeaf(arr(p.catalogPath))) err(`商品「${tag}」品类不是末级: ${catalogKey(arr(p.catalogPath))}`)
	if (p.brand !== meta.brand) err(`商品「${tag}」品牌应为 ${meta.brand}，当前 ${p.brand}`)
	if (p.series && !seriesNames.has(p.series)) err(`商品「${tag}」系列不存在: ${p.series}`)
	if (!scopeNames.has(p.scope)) err(`商品「${tag}」经营范围不存在: ${p.scope}`)
	for (const t of arr(p.tags)) if (!ptNames.has(t)) err(`商品「${tag}」标签不存在: ${t}`)
	for (const l of arr(p.labels)) if (!labelNames.has(l)) err(`商品「${tag}」吊牌不存在: ${l}`)
	if (!unitNames.has(p.unit)) err(`商品「${tag}」单位不存在: ${p.unit}`)
	if (p.tax && !taxNames.has(p.tax)) err(`商品「${tag}」税率不存在: ${p.tax}`)
	if (!isStr(p.freightTemplate) || !freightNames.has(p.freightTemplate)) {
		err(`商品「${tag}」运费模板不存在: ${p.freightTemplate}`)
	}
	if (!isNum(p.price) || p.price <= 0) err(`商品「${tag}」基准价必须 >0`)
	if (p.marketPrice !== undefined && p.marketPrice !== 0) {
		if (!isNum(p.marketPrice) || (isNum(p.price) && p.marketPrice < p.price)) {
			err(`商品「${tag}」划线价应 ≥ 基准价`)
		}
	}
	if (!isNum(p.middlePack) || p.middlePack < 1) err(`商品「${tag}」中包装应 ≥1`)
	if (!isNum(p.moq) || p.moq < 1) err(`商品「${tag}」最小起订量应 ≥1`)
	if (p.weight !== undefined && (!isNum(p.weight) || p.weight < 0)) err(`商品「${tag}」重量应 ≥0`)
	if (p.barcode) {
		if (!/^\d{13}$/.test(String(p.barcode))) warn(`商品「${tag}」条码不是 13 位数字: ${p.barcode}`)
		if (barcodes.has(p.barcode)) err(`商品条码重复: ${p.barcode}`)
		barcodes.add(p.barcode)
	}
	if (p.saleStatus !== '可售') err(`商品「${tag}」saleStatus 应为「可售」`)
	if (p.visibleStatus !== '可见') err(`商品「${tag}」visibleStatus 应为「可见」`)
	const mains = arr(p.images && p.images.main)
	if (mains.length < 1) err(`商品「${tag}」缺少主图 images.main`)
	const desc = arr(p.description)
	if (desc.length < 1) err(`商品「${tag}」缺少商品描述章节`)
	if (desc.length > 10) err(`商品「${tag}」描述章节超过 10 章`)
	for (const d of desc) {
		if (!isStr(d.title) || !isStr(d.body)) err(`商品「${tag}」描述章节需包含 title 与 body`)
	}
}

// ---------- 装修 ----------
const deco = data.decoration || {}
if (!isStr(deco.pcPageName)) err('decoration.pcPageName 不能为空')
if (arr(deco.banners).length < 3) err('decoration.banners 至少 3 张')
if (!deco.floorTheme || !isStr(deco.floorTheme.image)) err('decoration.floorTheme.image 不能为空')
if (!deco.floorTheme || !isStr(deco.floorTheme.title)) err('decoration.floorTheme.title 不能为空')
if (!deco.floorSplit || !isStr(deco.floorSplit.leftImage) || !isStr(deco.floorSplit.rightImage)) {
	err('decoration.floorSplit 需要 leftImage 与 rightImage')
}
if (!deco.productCard || !isStr(deco.productCard.conditionBrand)) err('decoration.productCard.conditionBrand 不能为空')
else if (deco.productCard.conditionBrand !== meta.brand) {
	warn(`装修商品组件条件品牌为 ${deco.productCard.conditionBrand}，与本次品牌 ${meta.brand} 不一致`)
}
if (deco.productCard && deco.productCard.count !== undefined && deco.productCard.count < 10) {
	warn('装修商品卡片 count < 10')
}
if (!deco.productBlock || arr(deco.productBlock.blocks).length < 2) warn('装修商品区块建议 2 个 block')
const menuItems = arr(deco.categoryMenu)
if (menuItems.length < 4 || menuItems.length > 6) err(`分类菜单项应 4–6 个，当前 ${menuItems.length}`)
for (const m of menuItems) if (!isStr(m.name)) err('decoration.categoryMenu[].name 不能为空')

// ---------- 图片存在性 ----------
if (checkImages) {
	const imageNames = new Set()
	for (const f of arr(deco.banners)) imageNames.add(f)
	const add = v => { if (isStr(v)) imageNames.add(v) }
	add(deco.floorTheme && deco.floorTheme.image)
	add(deco.floorSplit && deco.floorSplit.leftImage)
	add(deco.floorSplit && deco.floorSplit.rightImage)
	for (const c of catalogList) add(c.image)
	for (const b of arr(data.brands)) add(b.logo)
	for (const m of menuItems) add(m.icon)
	for (const p of products) {
		for (const f of arr(p.images && p.images.main)) add(f)
		for (const f of arr(p.images && p.images.detail)) add(f)
	}
	for (const name of imageNames) {
		const candidates = [path.join(dir, 'images', name), path.join(dir, name), name]
		if (!candidates.some(p => fs.existsSync(p))) warn(`图片不存在: ${name}`)
	}
}

// ---------- 输出 ----------
const counts = {
	经营范围: scopes.length,
	客户标签: custTags.length,
	客户区域: areas.length,
	客户: customers.length,
	商品品类: catalogList.length,
	商品: products.length,
	分类菜单: menuItems.length,
}
console.log(`Dataset: ${abs}`)
console.log(Object.entries(counts).map(([k, v]) => `${k}=${v}`).join('  '))
if (warnings.length) {
	console.log(`\nWarnings (${warnings.length}):`)
	for (const w of warnings.slice(0, 30)) console.log(`  - ${w}`)
	if (warnings.length > 30) console.log(`  ... 其余 ${warnings.length - 30} 条省略`)
}
if (errors.length) {
	console.log(`\nErrors (${errors.length}):`)
	for (const e of errors.slice(0, 50)) console.log(`  x ${e}`)
	if (errors.length > 50) console.log(`  ... 其余 ${errors.length - 50} 条省略`)
	console.log('\nRESULT: FAIL')
	process.exit(1)
}
console.log('\nRESULT: PASS')
