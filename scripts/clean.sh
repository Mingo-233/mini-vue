#!/bin/bash

rm -rf node_modules && pnpm -r exec rm -rf node_modules &&
rm -rf dist && pnpm -r exec rm -rf dist