#!/usr/bin/env node

/**
 * 简单的部署脚本
 * 使用方法: node deploy.js [patch|minor|major] [remote]
 * 默认: node deploy.js patch origin
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const args = process.argv.slice(2);
const versionType = args[0] || 'patch';
const remote = args[1] || 'origin';

console.log(`🚀 开始部署流程 (${versionType} 版本)...\n`);

try {
  // 1. 检查工作目录是否干净
  console.log('📋 检查工作目录状态...');
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  
  if (status.trim()) {
    console.log('⚠️  工作目录有未提交的更改:');
    console.log(status);
    
    // 尝试自动添加并提交
    console.log('\n🔄 自动添加并提交更改...');
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "自动提交: 部署前更改 (${new Date().toLocaleString()})"`, { stdio: 'inherit' });
  } else {
    console.log('✅ 工作目录干净');
  }

  // 2. 获取当前版本
  console.log('\n📦 获取当前版本信息...');
  const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
  const currentVersion = packageJson.version;
  console.log(`当前版本: ${currentVersion}`);

  // 3. 更新版本
  console.log(`\n🏷️  更新版本 (${versionType})...`);
  execSync(`npm version ${versionType} --no-git-tag-version`, { stdio: 'inherit' });
  
  // 获取新版本
  const newPackageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
  const newVersion = newPackageJson.version;
  console.log(`新版本: ${newVersion}`);

  // 4. 构建项目
  console.log('\n🔨 构建项目...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ 构建成功');
  } catch (error) {
    console.log('⚠️  构建失败，但继续部署...');
  }

  // 5. 提交版本更新
  console.log('\n💾 提交版本更新...');
  execSync('git add package.json', { stdio: 'inherit' });
  execSync(`git commit -m "发布版本 ${newVersion}"`, { stdio: 'inherit' });

  // 6. 创建标签
  console.log(`\n🏷️  创建版本标签 v${newVersion}...`);
  execSync(`git tag -a v${newVersion} -m "发布版本 ${newVersion}"`, { stdio: 'inherit' });

  // 7. 推送到远程
  console.log(`\n🚀 推送到 ${remote}...`);
  execSync(`git push ${remote} main`, { stdio: 'inherit' });
  execSync(`git push ${remote} --tags`, { stdio: 'inherit' });

  // 8. 完成
  console.log(`\n✅ 部署完成! 版本 ${newVersion} 已成功推送到 GitHub`);
  console.log('\n📋 下一步操作:');
  console.log('1. Vercel 可能会自动部署新版本');
  console.log('2. 检查 Vercel 部署状态');
  console.log('3. 如果需要，手动触发 Vercel 部署');

} catch (error) {
  console.error('\n❌ 部署过程中出错:');
  console.error(error.message);
  process.exit(1);
}