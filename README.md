# Requirements
* Node.js v14+
* Google Chrome
* (Optional) Visual Studio Code

## Requirements for Specific Language
* TypeScript
```bash
$ npm i -g esbuild
```
* Python (TODO)
* C++ (TODO)
* Kotlin (TODO)
* Go (TODO)
* Rust (TODO)

# Install
```bash
$ npm i -g leetcode-contest-cli
$ mkdir mySolutions
$ cd mySolutions
$ lcc init
```

# First run

## Google Chrome Executable Path
```bash
$ lcc
? Google Chrome executable path: › 
```
### Where to find Chrome

Type `chrome://version/` in the address bar.

Typical values:
* Mac OSX: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
* Windows: `C:\Program Files (x86)\Google\Chrome\Application`
* Linux: `/usr/bin/google-chrome-stable`

## Contest URL
```bash
$ lcc
✔ Google Chrome executable path: … /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
? Contest URL: › 
```

## Preferred Language
```bash
$ lcc
✔ Google Chrome executable path: … /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
✔ Contest URL: … https://leetcode.cn/contest/weekly-contest-298/
? Choose a language › - Use arrow-keys. Return to submit.
❯   TypeScript
```

## Login
Before doint this, make sure you have already registered for the contest or have started a virtual contest.

Login in the opened browser window.

# Solving Problems

## Choosing a Problem
```bash
$ lcc list
? Choose a problem › - Use arrow-keys. Return to submit.
❯   兼具大小写的最好英文字母
    个位数字为 K 的整数之和
    小于等于 K 的最长二进制子序列
    卖木头块
```

## Project Structure
```
exa --tree
.
├── contests
│  └── weekly-contest-298
│     └── greatest-english-letter-in-upper-and-lower-case
│        ├── id
│        ├── input
│        ├── output
│        ├── screenshot.png
│        └── src
│           └── ts
│              ├── lib -> ../../../../../lib/ts
│              └── solution.ts
└── lib
   └── ts
```
* `input`: Test input. Add new cases here.
* `output`: Expected output. Add new cases here.
* `screenshot.png`: Screenshot of original webpage.
* `solution.*`: Edit your solution here.
* `lib`: Put your code snippets here to be imported by your solution.

## Build Solution
```bash
$ lcc build

  ...eatest-english-letter-in-upper-and-lower-case/build/ts/solution.js  1.1kb

⚡ Done in 9ms
```

## Test Solution
```bash
$ lcc test
STARTED
expected:
"E"
"R"
""
got:
undefined
undefined
undefined
```
Edit your solution and test again:
```bash
$ lcc build && lcc test

  ...eatest-english-letter-in-upper-and-lower-case/build/ts/solution.js  1.4kb

⚡ Done in 2ms

PENDING
SUCCESS
```

## Submit Solution
```bash
$ lcc submit
STARTED
Accepted
runtime: 64 ms
memory: 43.1 MB
```

# Other Options

## Start Another Contest
```bash
$ lcc https://leetcode.cn/contest/biweekly-contest-81/
? Choose a problem › - Use arrow-keys. Return to submit.
❯   统计星号
    统计无向图中无法互相到达点对数
    操作后的最大异或和
    不同骰子序列的数目
```

## Use a Different Language
```bash
$ lcc lang
? Choose a language › - Use arrow-keys. Return to submit.
❯   TypeScript
```

# Troubleshooting

## Session Expired
Your login session may expire if you have logged in another browser window. You can login again if you have encountered errors.
```bash
$ lcc login
```
