# AniDB user scripts by Soulweaver

This repository consolidates the various user scripts I've written for [AniDB](https://anidb.net/) over the past
few years.

# How to use

First, install Tampermonkey (e.g. [for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en)
or [for Firefox](https://addons.mozilla.org/en-GB/firefox/addon/tampermonkey/)). After that, you can install a
script in here by clicking its name, then clicking "Raw" on the right. The add-on manager should then prompt you 
to verify you want to install the script and provide a way to review the code to be sure of its authenticity. 
Once a script is installed, you don't need to do anything else yourself – the script will run on the pages it 
is designed for and do its thing automatically.

User script add-ons other than Tampermonkey may or may not work. Specifically, for Greasemonkey, only versions up
to the latest 3.x series release will work. Greasemonkey 4, the only available GM version for modern Firefox versions,
**will not work** due to breaking changes introduced in it that don't appear to become remedied any time soon.

# Commit tag legend

Since this repository will contain several autonomous scripts, most commits will only involve one of the scripts at
a time. To aid locating commits that involve a specific script, the following tags will be used for each of them
respectively:

| Tag             | Script                                                                |
| :---            | :---                                                                  |
| \[ProgBars\]    | `AniDB_Achievement_Progress_Bars.user.js`                             |
| \[CmtCreq\]     | `AniDB_Extended_Comment_Creqs.user.js`                                |
| \[TodayBtn\]    | `AniDB_Mass_Add_Files_Today_Button.user.js`                           |
| \[DonutGraph\]  | `AniDB_Stats_Votes_as_Donut_Graph.user.js`                            |
| \[TLNumFinish\] | `AniDB_Timeline_Numbering_by_Finished_Date.user.js`                   |
| \[TLNumStart\]  | `AniDB_Timeline_Numbering_by_Started_Date.user.js`                    |
| \[TLZoom\]      | `AniDB_Timeline_Zoom_Control.user.js`                                 |

# License

Each script is licensed under the [MIT License](https://opensource.org/licenses/MIT).
