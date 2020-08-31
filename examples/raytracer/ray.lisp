(require vector.lisp)

(defun r/create (o d b tm)
  (pair (list 'origin 'direction 'bounces 'time)
        (o d b tm)))

(defun r/origin (r)
  (assoc 'origin r))

(defun r/direction (r)
  (assoc 'direction r))

(defun r/bounces (r)
  (assoc 'bounces r))

(defun r/time (r)
  (assoc 'time r))

(defun r/reflected (ray origin ref fuzz)
  (let ((dir (v/reflect (v/direction ray)
                        ref))
        (new_dir (cond
                  ((> fuzz 0)
                   (v/add dir
                          (v/scale (v/random-unit)
                                   fuzz)))
                  ('t dir))))
    (r/create origin
              new_dir
              (+ (r/bounces ray)
                 1))))

(defun r/point-at-length (ray lng)
  (v/add (r/origin ray)
         (v/scale (r/direction ray)
                  lng)))
