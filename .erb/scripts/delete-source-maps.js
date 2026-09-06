import fs from 'fs';
import path from 'path';
import webpackPaths from '../configs/webpack.paths';

function deleteSourceMapsIn(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  fs.readdirSync(dirPath)
    .filter((fileName) => fileName.endsWith('.js.map'))
    .forEach((fileName) => {
      fs.rmSync(path.join(dirPath, fileName), { force: true });
    });
}

export default function deleteSourceMaps() {
  deleteSourceMapsIn(webpackPaths.distMainPath);
  deleteSourceMapsIn(webpackPaths.distRendererPath);
}
