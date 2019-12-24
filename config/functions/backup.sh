
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [ ! -d "$DIR/backups/" ]; then
    mkdir $DIR/backups/
fi
mongodump --db be-lms --out $DIR/backups/`date +"%Y-%m-%d"`