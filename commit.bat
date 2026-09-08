@echo off
set "PATH=C:\Program Files\Microsoft Visual Studio\18\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd;%PATH%"
git config user.name Arumugam
git config user.email arumugam@example.com
git add -A
git commit -m "Initial commit: Tanglish++ Web IDE"
git log -n 1
