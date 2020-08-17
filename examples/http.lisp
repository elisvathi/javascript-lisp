(defvar http-module (n-require 'http))
(defun log (a) (n-call (n-get (n-global 'console) 'log) a))
(defun get-request-keys (r) (n-call (n-get (n-global Object) 'keys) r))
(defvar server (n-call (n-get http-module 'createServer) (n-callback (req res)
                                                                     (get-request-keys req))))
;; ()
;; (handle-request)
