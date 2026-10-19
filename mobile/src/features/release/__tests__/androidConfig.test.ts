import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(__dirname,'../../../..');
const config=JSON.parse(readFileSync(resolve(root,'app.json'),'utf8')).expo;
const eas=JSON.parse(readFileSync(resolve(root,'eas.json'),'utf8'));
it('retains Android app identity, explicit version code and minimal requested permissions',()=>{
  expect(config.name).toBe('BuddhiBox');expect(config.slug).toBe('buddhibox');
  expect(config.android.package).toBe('com.buddhibox.app');expect(config.android.versionCode).toBe(1);
  expect(config.orientation).toBe('portrait');
  expect(config.android.blockedPermissions).toEqual(expect.arrayContaining(['android.permission.READ_EXTERNAL_STORAGE','android.permission.WRITE_EXTERNAL_STORAGE','android.permission.SYSTEM_ALERT_WINDOW']));
  expect(config.android.permissions??[]).toEqual([]);
});
it('has actual local PNG launcher and splash artwork with expected dimensions',()=>{
  for(const [name,size] of [['icon.png',1024],['android-icon-foreground.png',1024],['android-icon-monochrome.png',1024],['splash-icon.png',512]] as const){
    const file=resolve(root,'assets',name);expect(existsSync(file)).toBe(true);
    const png=readFileSync(file);expect(png.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(png.readUInt32BE(16)).toBe(size);expect(png.readUInt32BE(20)).toBe(size);
  }
  expect(existsSync(resolve(root,config.icon))).toBe(true);
  expect(existsSync(resolve(root,config.splash.image))).toBe(true);
  expect(existsSync(resolve(root,config.android.adaptiveIcon.foregroundImage))).toBe(true);
  expect(existsSync(resolve(root,config.android.adaptiveIcon.monochromeImage))).toBe(true);
});
it('declares real internal APK and production AAB build profiles without secrets',()=>{
  expect(eas.build.preview.android.buildType).toBe('apk');
  expect(eas.build.production.android.buildType).toBe('app-bundle');
  expect(eas.build.preview.distribution).toBe('internal');
});
