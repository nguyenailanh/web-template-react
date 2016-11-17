WEB TEMPLATE
==================


## 1. Configuration
- Change GitLab repository in `package.json`
```js
"repository": {
  "type": "git",
  "url" : "..."
},
```

- Change GitLab default branch's name when deploy in `config.js`
```js
const options = {
  ghPage() {
    return {
      branch: 'gh-pages'
    }
  },
}
```

- Change ftp server in `config.js`
```js
const ftp = {
  host         : '...',
  username     : '...',
  password     : '...',
  base         : '...',
  groupFolder  : '...',
  projectFolder: '...'
};
```

- Modify Javascript Library **Order** in `config.js`
```js
const jsLib = [
  path.srcScript + '_lib/modernizr-custom-3.3.1.js',
  path.bower + 'detectizr/index.js',
  path.bower + 'jquery/index.js',
  path.srcScript + '_lib/custom.js'
];
```



## 2. Install dependencies
```bash
npm install #or npm i
```


## 3. Gulp tasks

### Build
- `gulp` : builds the project and runs the server.

- `gulp build` : builds the project without runs the server.

- Add ` --sync` to active ghost mode of BrowserSync (Clicks, Scrolls & Form inputs on any device will be mirrored to all others.). Example: `gulp build --sync`

### Deploy

- `gulp deploy` or `gulp deploy-git` : deploys the project on Gitlab with default branch.

- `gulp deploy --ftp` or `gulp deploy-ftp` : deploys the project on ftp server.

- `gulp deploy --all` or `gulp super-deploy` : deploys the project on Gitlab with default branch & ftp server.

- Add ` --m` to add message when deploy to Gitlab. Example: `gulp deploy --m="Deploy to git"` will deploy the project to GitLab with message **Deploy to git**

- Add ` --b` to change branch when deploy to Gitlab. Example: `gulp deploy --b="jira-test-01"` will deploy the project to GitLab on branch **jira-test-01**

- Combined `gulp deploy --m="Deploy to git" --b="jira-test-01"` will deploy the project to GitLab with message **Deploy to git** on branch **jira-test-01**

### Global Options

- Add ` --release` to minify and optimized the project. Example: `gulp build --release` or `gulp deploy --ftp --release`