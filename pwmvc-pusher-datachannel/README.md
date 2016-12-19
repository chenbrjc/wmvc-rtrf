# This app requires NodeJS, Git, and Bower installations

### Prerequisites: ###

1.  Download and install <a href="https://nodejs.org/en/download/">NodeJS</a>.
2.  Download and install <a href="https://git-scm.com/downloads">Git</a>.
3.  Install bower => npm install -g bower.

### Getting started with the app: ###

1.  Register and create an account at <a href="https://pusher.com/signup">Pusher</a>.  This account allow you to use Pusher as a signaler.
2.  Update config.js with the pusher_app_id, pusher_key, and pusher_secret from your Pusher account.
3.  Update \web\js\controllers\p2pController.js with the pusher_key from your Pusher account.
4.  Navigate to \wmvc-rtrf-master\pwmvc-pusher-datachannel => npm install (as admin user).
5.  Navigate to \wmvc-rtrf-master\pwmvc-pusher-datachannel\web =>> bower install (as admin user).
6.  Navigate back to \wmvc-rtrf-master\pwmvc-pusher-datachannel and start Node server => node blogApp.js.
7.  Point a blower to "http://localhost:5138/index.html".
8.  Point another browser to the same URL.
9.  Text entries in one browser will reflect in another right away.