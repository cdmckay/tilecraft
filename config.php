<?php

// Constants

define('MAX_TMP_DIR_SIZE', 100 * 1024 * 1024); // 100 MB
define('MAX_IMAGE_SIZE',    10 * 1024 * 1024); // 10 MB

// Config

$config = array(
    'tmp_dir' => (ini_get('upload_tmp_dir') ?: sys_get_temp_dir()) . DIRECTORY_SEPARATOR . 'tmxjs',
);


