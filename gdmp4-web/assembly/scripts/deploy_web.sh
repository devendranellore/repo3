#!/bin/bash

function usage
{
    cat <<EOF
$0 - GDMP 4 WEB Deployment scripts

Usage:
    $0 [OPTIONS]

    Options:
        -u              Remote user name (default: jenkins)
        -d              Delete extraneous files from dest dirs (adding --delete to rsync)
        -h              Show this message

EOF
}

CONFIG_TEMPLATE=configs/config.js.template

# Default info
USERNAME=jenkins
# Do NOT forget '/'
DEPLOY_TARGET=/var/www/html/
# Do NOT forget '/'
POM_BUILD_OUTPUT=target/gdmp4-webui/webui/
CONFIG_OUTPUT=${POM_BUILD_OUTPUT}/configs/config.js

RSYNC_OPTIONS=""

while getopts "u:dh" opt
do
    case "$opt" in
        u)
            echo "Override remote user to $OPTARG"
            USERNAME="$OPTARG"
        ;;
        d)
            echo "Delete extraneous files from dest dirs"
            RSYNC_OPTIONS="$RSYNC_OPTIONS --delete"
        ;;
        h)
            usage
            exit 0
        ;;
    esac
done

if [ ! -n "$TARGET" ]
then
    echo "No target is given"
    exit 1
fi

echo "Target -> ${TARGET}"

case "$TARGET" in
    westlake)
        WEB_SERVER=10.0.42.204
        BASE_URL="http://gdmp.hz.insigmaus.com:8080/gdmp-server/web/api/"
        ;;
    shanghai)
        WEB_SERVER=10.243.117.89
        BASE_URL="http://10.243.117.89:8080/gdmp-server/web/api/"
        ;;
    chappaqua)
        WEB_SERVER=192.168.10.69
        BASE_URL="https://chappaqua.ny.insigmaus.com/gdmp-server/web/api/"
        ;;
    goldensbridge)
        WEB_SERVER=192.168.10.211
        BASE_URL="https://goldensbridge.ny.insigmaus.com/gdmp-server/web/api/"
        ;;
    mtkisco)
        WEB_SERVER=192.168.10.67
        BASE_URL="https://ny.insigmaus.com/gdmp-server/web/api/"
        ;;
    fairfield)
        WEB_SERVER=192.168.10.73
        BASE_URL="https://ny.insigmaus.com/gdmp-server-fairfield/web/api/"
        ;;	
    RSSQA-4.0)
        WEB_SERVER="10.106.15.15 10.106.15.16"
        BASE_URL="https://gdmpqa.covidien.com/gdmp-server/web/api/"
        ;;
    RSSQAINT-4.0)
        WEB_SERVER=10.106.15.22
        BASE_URL="https://gdmpqa-int.covidien.com:8443/gdmp-server/web/api/"
        ;;
	RSSQAPROD-4.0)
	    WEB_SERVER=10.106.15.11
        BASE_URL="https://gdmpqaprod.covidien.com/gdmp-server/web/api/"
		;;
    *)
        echo "Unspecified deployment target"
        exit 1
        ;;
esac


# Replace parameters by deployment target
echo "Preparing configuration for ${TARGET}"
mkdir -p `dirname ${CONFIG_OUTPUT}` || exit 1
rsync -av ${CONFIG_TEMPLATE} ${CONFIG_OUTPUT} || exit 1

echo "Setting BASE_URL"
ESCAPED_VALUE=$(sed 's/[&/\]/\\&/g' <<<"${BASE_URL}")
sed -i "s/.*'BASE_URL'.*/            'BASE_URL': '${ESCAPED_VALUE}',/" ${CONFIG_OUTPUT}


# Deploy gdmp4-web package
for TARGET_HOST in $WEB_SERVER
do
    # Sync GDMP Web Core Implementation
    echo "Syncing GDMP Core Implementation to ${TARGET_HOST}"
    rsync -av ${RSYNC_OPTIONS} $POM_BUILD_OUTPUT/ $USERNAME@${TARGET_HOST}:${DEPLOY_TARGET} || exit 1
done

