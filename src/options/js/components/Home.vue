<template><div id="home" class="container"><div class="jumbotron"><h1 id="myfreecams-assistant">Myfreecams Assistant</h1>
<p>The MFC Chat bot that puts you in charge of your room!</p>
<h2 id="key-features">Key Features</h2>
<ul>
<li><b>Point and Click</b> - No confusing commands to learn. Just change a few options and then it&#39;s all point and click!</li>
<li><b>Ease of Use</b> - Our straight forward design makes the MFC Assistant extremely easy to learn!</li>
<li><b>Tip Wars</b> is a game where you to set 2 teams and a winning goal. Members support these teams    by tipping Even or Odd numbers until their team wins!</li>
<li><b>Token Keno</b> is a game where you set a range of numbers that your members can tip to win a prize. Prizes are randomly generated when the game starts and the game ends when all prizes have been won, and/or when all numbers have been tipped.</li>
<li><b>Saved/Timed Messages</b> - You can set saved messages that you can click to post them to your room. Alternatively, you can set them up on a timer so they automatically post at an interval you set! This is perfect for advertisements during your shows!</li>
<li><b>Actively Developed!</b> - There are certainly more features to come! I also look forward to your feedback! If you have an idea for a feature or you found a bug contact me!<br><br><b>Twitter:</b> <a href="https://www.twitter.com/Moros1138">@Moros1138</a><br><b>Email:</b> <a href="mailto:moros1138@gmail.com">moros1138@gmail.com</a></li>
</ul>
<h2 id="legal-stuff">Legal Stuff</h2>
<p>Moros1138 is in no way associated, affiliated with or connected in any way whatsoever to Myfreecams.com or any of their affiliates or related organizations.</p>
<p>This software is released under the MIT License, see LICENSE.md for full details. The plain english points of the license are as follows:</p>
<h3 id="permissions">Permissions</h3>
<ul>
<li>This software and derivatives may be used for commercial purposes.</li>
<li>You may distribute this software.</li>
<li>This software may be modified.</li>
<li>You may use and modify the software without distributing it.</li>
</ul>
<h3 id="conditions">Conditions</h3>
<ul>
<li>Include a copy of the license and copyright notice with the code.</li>
</ul>
<h3 id="limitations">Limitations</h3>
<ul>
<li>Software is provided without warranty and the software author/license owner cannot be held liable for damages.</li>
</ul>
<h2 id="acknowledgements">Acknowledgements</h2>
<p>Special thanks to <a href="https://www.twitter.com/KradekMFC">@KradekMFC</a> for his work on the MFC Assistant userscript which served as inspiration when I was in the early stages of developing this software. Plus he&#39;s just awesome!</p>
<h2 id="version-history">Version History</h2>
<ul>
<li>1.0.15<ul>
<li>Updated UI hooks.</li>
</ul>
</li>
<li>1.0.14<ul>
<li>Switched to Vue.js for components and page routing</li>
<li>Added NumberInput component for form fields requiring numbers</li>
<li>Added TextInput component for form fields requiring text</li>
<li>Added YesNoInput component for form fields requiring Yes/No radios</li>
<li>All form components now have built in validation!</li>
<li>Fixed chat form submit bug.</li>
<li>Fixed icon toggles for Start/Stop Timer in Messages</li>
<li>Fixed icon toggles for Add to/Remove from Carousel in Message</li>
<li>Added Disable all message inputs and message removal while the Message Carousel is running</li>
<li>Added Disable all game inputs while the game is running.</li>
<li>Added Confirm dialogs to Remove Message and Stop buttons for the games</li>
</ul>
</li>
<li>1.0.13<ul>
<li>Tweak Firefox deployment.</li>
<li>Fix token keno bug.</li>
<li>Added Footer and Donate button.</li>
<li>Fixed dropdown menu click bug.</li>
<li>Remove autocomplete from chat and fake tip.</li>
<li>Added member&#39;s site module.</li>
<li>Added Message Carousel to Saved/Timed Messages.</li>
</ul>
</li>
<li>1.0.12f<ul>
<li>Firefox first release!</li>
</ul>
</li>
<li>1.0.12a-e<ul>
<li>Firefox automatic update tests (unreleased)</li>
</ul>
</li>
<li>1.0.12<ul>
<li>Fixed token keno.</li>
</ul>
</li>
<li>1.0.11<ul>
<li>Tweaked manifest.json for Firefox compatibility.</li>
</ul>
</li>
<li>1.0.10<ul>
<li>Added ninja tip event</li>
<li>Fixed private show bug by adding not-ready event</li>
<li>not-ready event stops all games and timers</li>
</ul>
</li>
<li>1.0.9<ul>
<li>Fixed chat emote/image stripping!</li>
</ul>
</li>
<li>1.0.8<ul>
<li>Switched content/injected script to run inside MyFreeCams&#39; Model Web instead of the member&#39;s site</li>
<li>Removed chat page</li>
<li>Moved testing Fake Tip to the Options page.Fixed tip capturing issue</li>
</ul>
</li>
<li>1.0.7<ul>
<li>Added model only requirement for sending messages</li>
<li>Added private message handler</li>
</ul>
</li>
<li>1.0.6<ul>
<li>Added icons</li>
</ul>
</li>
<li>1.0.5<ul>
<li>Updated layout/styles</li>
<li>Code refactoring</li>
<li>Minor tweaks in Options page</li>
<li>sendMsg dialog</li>
<li>Added model changed event</li>
<li>Fixed saved/timed message description update/sync and timer clearing</li>
<li>Turn every navbar link into a page</li>
<li>Removed defunct css</li>
<li>Tip Wars is now called Tip War</li>
<li>Tweak chrome extension manifest</li>
</ul>
</li>
<li>1.0.4<ul>
<li>checkNaN remove click events</li>
<li>Changed updateSettings to handle data/dom</li>
<li>Update layout to be responsive</li>
</ul>
</li>
<li>1.0.3<ul>
<li>Added &quot;number required&quot; errors for delay inputs</li>
<li>Move Options styles into options/css/options.css</li>
</ul>
</li>
<li>1.0.2<ul>
<li>Added maximum token calculator.</li>
<li>Fixed window/tab targetting issue.</li>
<li>Added saved/timed messages</li>
</ul>
</li>
<li>1.0.1<ul>
<li>moved ui away from content/injected script</li>
</ul>
</li>
<li>1.0.0<ul>
<li>inital commit</li>
</ul>
</li>
</ul>
</div></div></template>

<script>
export default {
	name: 'home',
	beforeRouteEnter: function (to, from, next) {
		if(window.maReady) {
			next()
		} else {
			next(false)
		}
	}
}
</script>