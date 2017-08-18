#!/bin/bash

SERVER_BUILD_INFO=configs/config.js.template

if [ -n "${BRANCH_NAME}" ]
then
    git checkout -b ${BRANCH_NAME} origin/${BRANCH_NAME}
fi

# Get current Build Number
MAJOR=`sed -rn "s/.*APP_VERSION_MAJOR': '([0-9]+)',/\1/p" ${SERVER_BUILD_INFO}`
MINOR=`sed -rn "s/.*APP_VERSION_MINOR': '([0-9]+)',/\1/p" ${SERVER_BUILD_INFO}`
PATCH=`sed -rn "s/.*APP_VERSION_PATCH': '([0-9]+)',/\1/p" ${SERVER_BUILD_INFO}`
CURRENT_BUILD=`sed -rn "s/.*APP_VERSION_BUILD': '([0-9]+)',/\1/p" ${SERVER_BUILD_INFO}`
NEXT_BUILD=$((CURRENT_BUILD + 1))

# Update BUILD
sed -i "s/.*'APP_VERSION_BUILD'.*/            'APP_VERSION_BUILD': '${NEXT_BUILD}',/" ${SERVER_BUILD_INFO}

echo "MAJOR: $MAJOR"
echo "MINOR: $MINOR"
echo "PATCH: $PATCH"
echo "BUILD: ${CURRENT_BUILD} -> ${NEXT_BUILD}"


# Get short commit hash of current commit
COMMITHASH=`git rev-parse --short HEAD`

if [ $? -ne 0 ]
then
    echo "Failed to get short commit hash of current commit"
    exit 1
fi

# Update commit hash
sed -i "s/.*'COMMIT_HASH'.*/            'COMMIT_HASH': '$COMMITHASH',/" ${SERVER_BUILD_INFO}
echo "BUILD_COMMIT_HASHTAG: $COMMITHASH"


EXTEND_VERSION_NUMBER="${MAJOR}.${MINOR}.${PATCH}.${NEXT_BUILD}.$COMMITHASH"
echo "Version: ${EXTEND_VERSION_NUMBER}"

# Update APP_VERSION
sed -i "s/.*'APP_VERSION'.*/            'APP_VERSION': '${EXTEND_VERSION_NUMBER}',/" ${SERVER_BUILD_INFO}

# Commit Build Info
if [ -n "${BRANCH_NAME}" ]
then
    git commit ${SERVER_BUILD_INFO} -m "BUILD - ${EXTEND_VERSION_NUMBER} - #$BUILD_NUMBER" && git push origin ${BRANCH_NAME}
fi
