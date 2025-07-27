// 测试不同格式的数据库ID
const originalId = '22e64c0b37ed8010b7dfd3e531d46ae6';

// 添加连字符的格式
const formattedId = originalId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');

console.log('Original ID:', originalId);
console.log('Formatted ID:', formattedId);

// 测试URL中的ID提取
console.log('\n如果你的数据库URL是这样的格式：');
console.log(`https://www.notion.so/your-workspace/${originalId}?v=...`);
console.log('或者：');
console.log(`https://www.notion.so/your-workspace/${formattedId}?v=...`);

export { originalId, formattedId };