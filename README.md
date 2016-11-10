# Myfreecams Assistant

The MFC Chat bot that puts you in charge of your room!

## Key Features

* <b>Point and Click</b> - No confusing commands to learn. Just change a few options and then it's all point and click!
* <b>Ease of Use</b> - Our straight forward design makes the MFC Assistant extremely easy to learn!
* <b>Tip Wars</b> is a game where you to set 2 teams and a winning goal. Members support these teams	by tipping Even or Odd numbers until their team wins!
* <b>Token Keno</b> is a game where you set a range of numbers that your members can tip to win a prize. Prizes are randomly generated when the game starts and the game ends when all prizes have been won, and/or when all numbers have been tipped.
* <b>Saved/Timed Messages</b> - You can set saved messages that you can click to post them to your room. Alternatively, you can set them up on a timer so they automatically post at an interval you set! This is perfect for advertisements during your shows!
* <b>Actively Developed!</b> - There are certainly more features to come! I also look forward to your feedback! If you have an idea for a feature or you found a bug contact me!<br><br><b>Twitter:</b> [@Moros1138](https://www.twitter.com/Moros1138)<br><b>Email:</b> [moros1138@gmail.com](mailto:moros1138@gmail.com)

## Legal Stuff

Moros1138 is in no way associated, affiliated with or connected in any way whatsoever to Myfreecams.com or any of their affiliates or related organizations.

This software is released under the MIT License, see LICENSE.md for full details. The plain english points of the license are as follows:

### Permissions
* This software and derivatives may be used for commercial purposes.
* You may distribute this software.
* This software may be modified.
* You may use and modify the software without distributing it.

### Conditions
* Include a copy of the license and copyright notice with the code.

### Limitations
* Software is provided without warranty and the software author/license owner cannot be held liable for damages.


## Acknowledgements

Special thanks to [@KradekMFC](https://www.twitter.com/KradekMFC) for his work on the MFC Assistant userscript which served as inspiration when I was in the early stages of developing this software. Plus he's just awesome!

## Version History
* 1.0.12f
  * Firefox first release!
* 1.0.12a-e
  * Firefox automatic update tests (unreleased)
* 1.0.12
  * Fixed token keno.
* 1.0.11
  * Tweaked manifest.json for Firefox compatibility.
* 1.0.10
  * Added ninja tip event
  * Fixed private show bug by adding not-ready event
  * not-ready event stops all games and timers
* 1.0.9
  * Fixed chat emote/image stripping!
* 1.0.8
  * Switched content/injected script to run inside MyFreeCams' Model Web instead of the member's site
  * Removed chat page
  * Moved testing Fake Tip to the Options page.Fixed tip capturing issue
* 1.0.7
  * Added model only requirement for sending messages
  * Added private message handler
* 1.0.6
  * Added icons
* 1.0.5
  * Updated layout/styles
  * Code refactoring
  * Minor tweaks in Options page
  * sendMsg dialog
  * Added model changed event
  * Fixed saved/timed message description update/sync and timer clearing
  * Turn every navbar link into a page
  * Removed defunct css
  * Tip Wars is now called Tip War
  * Tweak chrome extension manifest
* 1.0.4
  * checkNaN remove click events
  * Changed updateSettings to handle data/dom
  * Update layout to be responsive
* 1.0.3
  * Added "number required" errors for delay inputs
  * Move Options styles into options/css/options.css
* 1.0.2
  * Added maximum token calculator.
  * Fixed window/tab targetting issue.
  * Added saved/timed messages
* 1.0.1
  * moved ui away from content/injected script
* 1.0.0
  * inital commit
