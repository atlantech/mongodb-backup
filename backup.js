#!/usr/bin/env node

const fs = require('fs');
const fsExtra = require('fs-extra');
const childProcess = require('child_process');
const moment = require('moment');
const { host, port, db, username, password, backupsCount } = require('./config.json');

const BACKUP_FOLDER = 'backups';

const timestamp = moment().format();
const backupPath = __dirname + `/${BACKUP_FOLDER}`;
const out = `${backupPath}/${timestamp}`;

if (!fs.existsSync(backupPath)) {
    console.log(`Creating ${backupPath}...`);

    fs.mkdirSync(backupPath);
}

console.log('Starting backup...');

childProcess.execSync(
    `mongodump \
        --host=${host} \
        --port=${port} \
        --db=${db} \
        --username=${username} \
        --password=${password} \
        --out=${out} \
        --gzip`,
    { stdio: 'inherit' }
);

let backups = fs.readdirSync(backupPath);

backups.sort(function(a, b) {
    if (moment(a).isBefore(b)) {
        return -1;
    }

    if (moment(a).isSame(b)) {
        return 0;
    }

    return 1;
});

if (backups.length > backupsCount) {
    for (let i = 0; i < backups.length - backupsCount; i++) {
        console.log(`Removing old backup ${backups[i]}...`);
        
        fsExtra.removeSync(`${backupPath}/${backups[i]}`);
    }
}