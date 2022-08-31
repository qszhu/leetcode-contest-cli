import chai from 'chai'
import 'mocha'

import { extractContestId, extractOutput } from './utils'

const assert = chai.assert

describe('utils', () => {
  it('should extract contest id from url', async () => {
    const id = extractContestId('https://leetcode.cn/contest/zj-future2022/')
    assert.equal(id, 'zj-future2022')
  })

  it('should extract contest id from url without trailing slash', async () => {
    const id = extractContestId('https://leetcode.cn/contest/zj-future2022')
    assert.equal(id, 'zj-future2022')
  })

  it('should not extract contest id from other urls', async () => {
    const id = extractContestId('https://leetcode.cn/problemset/all')
    assert.isUndefined(id)
  })

  it('should extract output from Chinese problems', async () => {
    const htmlContent = `
<p>假设有若干信号发射源定时发送信号，&nbsp;<code>signals[i] = [start, end)</code>&nbsp;表示第 <code>i</code>&nbsp;个信号发射源运作的开始时间 <code>start</code>&nbsp;和停止时间 <code>end</code>&nbsp;。</p>

<p>若调度员的接收设备同一时刻仅能接收一个发射源发出的信号，请判断调度员能否收到<strong>所有</strong>发射源的<strong>完整信号</strong>。</p>

<p>&nbsp;</p>

<p><strong>注意</strong>：只有接收了一个信号源从开始到结束的所有信号才算<strong>完整信号</strong>。</p>

<p>&nbsp;</p>

<p><strong>示例 1：</strong></p>

<pre><strong>输入：</strong>signals = [[0,40],[10,15],[20,30]]
<strong>输出</strong>：false
<strong>解释：
</strong>时间 [10,15) 内不能同时接收信号 0 和信号 1，
时间 [20,30) 内不能同时接收信号 0 和信号 2。</pre>

<p><strong>示例 2：</strong></p>

<pre><strong>输入：</strong>signals = [[2,8],[8,14]]
<strong>输出</strong>：true
</pre>

<p><strong>示例 3：</strong></p>

<pre><strong>输入：</strong>signals = [[9,12],[2,3]]
<strong>输出</strong>：true
</pre>

<p>&nbsp;</p>

<p><strong>提示：</strong></p>

<ul>
        <li><code>0 &lt;= signals.length &lt;= 10<sup>4</sup></code></li>
        <li><code>signals[i].length == 2</code></li>
        <li><code>0 &lt;= start<sub>i</sub> &lt;&nbsp;end<sub>i</sub> &lt;= 10<sup>6</sup></code></li>
</ul>
`
    const outputs = extractOutput(htmlContent, true)
    assert.equal(outputs, 'false\ntrue\ntrue')
  })

  it('should extract output from Chinese problem with half-width colon', async () => {
    const htmlContent = `
<p>现有一个黑白棋游戏，初始时给出一排棋子，记作数组 <code>chess</code>，其中白色棋子记作 <code>0</code>，黑色棋子记作 <code>1</code>。用户可以每次交换 <strong>任意位置</strong> 的两颗棋子的位置。</p>

<p>为了使得所有黑色棋子相连，请返回最少需要交换多少次。</p>

<p>&nbsp;</p>

<p><strong>示例 1:</strong></p>

<pre><strong>输入:</strong> chess = [1,0,1,0,1,0]
<strong>输出:</strong> 1
<strong>解释: </strong>
有四种可能的方法可以把所有的 1 组合在一起：
[1,1,1,0,0,0]，交换 1 次；
[0,1,1,1,0,0]，交换 2 次；
[0,0,1,1,1,0]，交换 1 次；
[0,0,0,1,1,1]，交换 2 次。
所以最少的交换次数为 1。
</pre>

<p><strong>示例&nbsp; 2:</strong></p>

<pre><strong>输入：</strong>chess =&nbsp;[0,0,0,1,0]
<strong>输出：</strong>0
<strong>解释： </strong>
由于数组中只有一个 1，所以不需要交换。</pre>

<p><strong>示例 3:</strong></p>

<pre><strong>输入：</strong>chess =&nbsp;[1,1,0,1,0,1,0,0,1,0,1]
<strong>输出：</strong>2<strong>
解释：
</strong>最佳方案为 [1,1,1,1,1,1,0,0,0,0,0]，
因此返回最少交换 2 次</pre>

<p>&nbsp;</p>

<p><strong>提示:</strong></p>

<ul>
        <li><code>1 &lt;= chess.length &lt;= 10<sup>5</sup></code></li>
        <li><code>chess[i]</code>&nbsp;==&nbsp;<code>0</code>&nbsp;或&nbsp;<code>1</code>.</li>
</ul>
`
    const outputs = extractOutput(htmlContent, true)
    assert.equal(outputs, '1\n0\n2')
  })

  it('should extract output from Chinese problem with block quotes', async () => {
    const htmlContent = `
<div class="question-content default-content"><p>网页布局中有一种瀑布流布局方式，表现为参差不齐的多栏布局。随着页面滚动条向下，还会不断加载数据块并附加至当前尾部。页面在加载时遵循以下规则：</p>
<ul>
<li>当有数据块需要加载时，优先加载在高度最短的那一列；</li>
<li>若存在多个高度相同且最短的情况，则加载在其中最靠左的那一列</li>
</ul>
<p>已知当前网页共分割为 <code>num</code> 列，该网页有若干数据块可以加载，<code>block[i]</code> 表示第 <code>i</code> 个数据块的高度。当页面按顺序加载完所有的数据块后，请返回高度最大的那一列的高度。</p>
<p><strong>示例 1：</strong></p>
<blockquote>
<p>输入：<code>num = 3, block = [5,9,8,6]</code></p>
<p>输出：<code>11</code></p>
<p>解释：如下图所示，返回 11<br>
<img src="https://pic.leetcode-cn.com/1646291905-AqDTIl-image.png" alt="image.png" width="300px"></p>
</blockquote>
<p><strong>示例 2：</strong></p>
<blockquote>
<p>输入：<code>num = 2, block = [9,1,1,1,1,1]</code></p>
<p>输出：<code>9</code></p>
</blockquote>
<p><strong>提示：</strong></p>
<ul>
<li><code>0 &lt; num &lt;= 100</code></li>
<li><code>0 &lt; block.length &lt;= 10^4</code></li>
<li><code>0 &lt; block[i] &lt;= 10^3</code></li>
</ul>
</div>
`
    const outputs = extractOutput(htmlContent, true)
    assert.equal(outputs, '11\n9')
  })

  it('should extract output from English problems', async () => {
    const htmlContent = `
<p>You are given the strings <code>key</code> and <code>message</code>, which represent a cipher key and a secret message, respectively. The steps to decode <code>message</code> are as follows:</p>

<ol>
        <li>Use the <strong>first</strong> appearance of all 26 lowercase English letters in <code>key</code> as the <strong>order</strong> of the substitution table.</li>
        <li>Align the substitution table with the regular English alphabet.</li>
        <li>Each letter in <code>message</code> is then <strong>substituted</strong> using the table.</li>
        <li>Spaces <code>' '</code> are transformed to themselves.</li>
</ol>

<ul>
        <li>For example, given <code>key = "<u><strong>hap</strong></u>p<u><strong>y</strong></u> <u><strong>bo</strong></u>y"</code> (actual key would have <strong>at least one</strong> instance of each letter in the alphabet), we have the partial substitution table of (<code>'h' -&gt; 'a'</code>, <code>'a' -&gt; 'b'</code>, <code>'p' -&gt; 'c'</code>, <code>'y' -&gt; 'd'</code>, <code>'b' -&gt; 'e'</code>, <code>'o' -&gt; 'f'</code>).</li>
</ul>

<p>Return <em>the decoded message</em>.</p>

<p>&nbsp;</p>
<p><strong>Example 1:</strong></p>
<img alt="" src="https://assets.leetcode.com/uploads/2022/05/08/ex1new4.jpg" style="width: 752px; height: 150px;">
<pre><strong>Input:</strong> key = "the quick brown fox jumps over the lazy dog", message = "vkbs bs t suepuv"
<strong>Output:</strong> "this is a secret"
<strong>Explanation:</strong> The diagram above shows the substitution table.
It is obtained by taking the first appearance of each letter in "<u><strong>the</strong></u> <u><strong>quick</strong></u> <u><strong>brown</strong></u> <u><strong>f</strong></u>o<u><strong>x</strong></u> <u><strong>j</strong></u>u<u><strong>mps</strong></u> o<u><strong>v</strong></u>er the <u><strong>lazy</strong></u> <u><strong>d</strong></u>o<u><strong>g</strong></u>".
</pre>

<p><strong>Example 2:</strong></p>
<img alt="" src="https://assets.leetcode.com/uploads/2022/05/08/ex2new.jpg" style="width: 754px; height: 150px;">
<pre><strong>Input:</strong> key = "eljuxhpwnyrdgtqkviszcfmabo", message = "zwx hnfx lqantp mnoeius ycgk vcnjrdb"
<strong>Output:</strong> "the five boxing wizards jump quickly"
<strong>Explanation:</strong> The diagram above shows the substitution table.
It is obtained by taking the first appearance of each letter in "<u><strong>eljuxhpwnyrdgtqkviszcfmabo</strong></u>".
</pre>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
        <li><code>26 &lt;= key.length &lt;= 2000</code></li>
        <li><code>key</code> consists of lowercase English letters and <code>' '</code>.</li>
        <li><code>key</code> contains every letter in the English alphabet (<code>'a'</code> to <code>'z'</code>) <strong>at least once</strong>.</li>
        <li><code>1 &lt;= message.length &lt;= 2000</code></li>
        <li><code>message</code> consists of lowercase English letters and <code>' '</code>.</li>
</ul>
`
    const outputs = extractOutput(htmlContent, false)
    assert.equal(outputs, '"this is a secret"\n"the five boxing wizards jump quickly"')
  })
})
