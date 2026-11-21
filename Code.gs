const SHEETS = {
  Profile: ['id','name','title','intro','photoUrl','cvUrl'],
  Skills: ['id','name','category','description','icon','proficiency','order'],
  Projects: ['id','title','category','description','thumbnailUrl','videoUrl','liveUrl','sourceUrl','featured','published','order'],
  Experience: ['id','role','organization','startDate','endDate','description','order'],
  Education: ['id','institution','program','startDate','endDate','description','order'],
  Certifications: ['id','name','issuer','date','url','order'],
  Social: ['id','platform','url','order'],
  Settings: ['key','value'],
  Messages: ['id','name','email','message','createdAt','status']
};

function doGet(e) {
  try {
    const action = (e.parameter.action || 'all').toLowerCase();
    if (action === 'health') return json_({ok:true, service:'Google Sheets Portfolio API'});
    if (action === 'table') return json_({ok:true, table: e.parameter.table || '', rows: readTable_(e.parameter.table || '')});
    return json_({ok:true, data: readAll_()});
  } catch (err) { return json_({ok:false,error:String(err)}); }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (!validKey_(body.key)) return json_({ok:false,error:'Unauthorized'});
    const action = body.action || 'upsert';
    if (action === 'message') return json_({ok:true,id:insertRow_('Messages', body.data || {})});
    if (action === 'delete') return json_({ok:true,deleted:deleteRow_(body.table, body.id)});
    return json_({ok:true,id:upsertRow_(body.table, body.data || {})});
  } catch (err) { return json_({ok:false,error:String(err)}); }
}

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    const headers = SHEETS[name];
    sh.getRange(1,1,1,headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  });
  PropertiesService.getScriptProperties().setProperty('SETUP_DONE','true');
  return 'Sheets created';
}

function validKey_(key) {
  const saved = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  return !!saved && String(key || '') === saved;
}

function sheet_(name) {
  if (!SHEETS[name]) throw new Error('Unknown table: '+name);
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('Run setupSheets() first');
  return sh;
}

function readAll_() {
  const out = {};
  Object.keys(SHEETS).forEach(n => out[n] = readTable_(n));
  return out;
}

function readTable_(name) {
  const sh = sheet_(name);
  const values = sh.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter(r => r.some(v => v !== '')).map(r => {
    const o = {}; headers.forEach((h,i)=>o[h]=r[i]); return o;
  });
}

function upsertRow_(name, data) {
  const sh = sheet_(name), headers = SHEETS[name];
  const id = String(data.id || Utilities.getUuid());
  const values = headers.map(h => h === 'id' ? id : (data[h] ?? ''));
  const rows = sh.getDataRange().getValues();
  let row = -1;
  if (headers.indexOf('id') >= 0) {
    for (let i=1;i<rows.length;i++) if (String(rows[i][0]) === id) { row=i+1; break; }
  }
  if (row > 0) sh.getRange(row,1,1,headers.length).setValues([values]);
  else sh.appendRow(values);
  return id;
}

function insertRow_(name, data) { return upsertRow_(name, data); }

function deleteRow_(name,id) {
  const sh=sheet_(name), rows=sh.getDataRange().getValues();
  for(let i=1;i<rows.length;i++) if(String(rows[i][0])===String(id)){ sh.deleteRow(i+1); return true; }
  return false;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
