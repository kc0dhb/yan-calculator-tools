#!/bin/bash
gulp dist && rsync -aP dist/ root@meadadvocate.org:/var/www/tools/yan-calculator-tools/
