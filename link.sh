cd client || exit
npm uninstall

cd ../admin || exit
npm link ../client

