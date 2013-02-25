<?php

require_once 'config.php';

$id = isset($_GET['id']) ? $_GET['id'] : null;
if (!$id) {
    error_log('Id must be specified');
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'download':
        routeDownload($id);
        break;
    default:
        routeDefault($id);
        break;
}

// Routers

function routeDownload($id) {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            actionDownload($id);
            break;
        default:
            throw new Exception('Not implemented');
    }
}

function routeDefault($id) {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'PUT':
            actionUpdate($id);
            break;
        default:
            throw new Exception('Not implemented');
    }
}

// Actions

function actionDownload($id) {
    global $config;

    $map_dir = $config['tmp_dir'] . DIRECTORY_SEPARATOR . $id;
    $tmxu_file = $map_dir . DIRECTORY_SEPARATOR . 'map.tmxu';
    $tmx_file = $map_dir . DIRECTORY_SEPARATOR . 'map.tmx';

    // Remove all non-TMX files.
    foreach (glob($map_dir . '/*') as $file) {
        if (substr($file, -4) === 'tmxu') continue;
        @unlink($file);
    }

    // Open the TMXU (TMX with URLs) file.
    $xml = file_get_contents($tmxu_file);
    $doc = simplexml_load_string($xml);

    // Download all the tile set images.
    $image_nodes = $doc->xpath('//image');
    $bytes_read = 0;
    foreach ($image_nodes as $i => $image_node) {
        $source = $image_node['source'];
        $destination_filename = 'tile-set-' . $i . '.' . strtolower(substr($source, -3));
        if (substr($source, 0, 4) === 'http') {
            $contents = '';
            $source_handle = fopen($source, 'rb');
            while (!feof($source_handle)) {
                if ($bytes_read > MAX_IMAGE_SIZE) {
                    fclose($source_handle);
                    error_log('Max image size exceeded: +' . ($bytes_read - MAX_IMAGE_SIZE));
                    exit;
                }
                $contents .= fread($source_handle, 8192);
                $bytes_read += 8192;
            }
            fclose($source_handle);
            file_put_contents($map_dir . DIRECTORY_SEPARATOR . $destination_filename, $contents);
        } else {
            copy(
                './examples' . DIRECTORY_SEPARATOR . $source,
                $map_dir . DIRECTORY_SEPARATOR . $destination_filename
            );
        }

        // Change the source in the TMX file to the local filename.
        $image_node['source'] = $destination_filename;
    }

    // Write the new TMX file.
    $doc->asXML($tmx_file);

    // Create the zip archive.
    $zip_archive = new ZipArchive();
    $zip_file = $map_dir . DIRECTORY_SEPARATOR . 'map.zip';
    $result = $zip_archive->open($zip_file, ZipArchive::CREATE);
    if ($result) {
        $zip_archive->addFile($tmx_file, 'map.tmx');
        foreach (glob($map_dir . '/*') as $file) {
            if (substr($file, -3) === 'tmx' || substr($file, -4) === 'tmxu') continue;
            $zip_archive->addFile($file, pathinfo($file, PATHINFO_BASENAME));
        }
        $zip_archive->close();

        header('Content-Type: application/zip');
        header(sprintf('Content-Disposition: attachment; filename="%s"', 'map-' . time() . '.zip'));
        echo file_get_contents($zip_file);
    } else {
        error_log('Failed to create ZIP archive');
        exit;
    }
}

function actionUpdate($id) {
    global $config;

    $map_dir = $config['tmp_dir'] . DIRECTORY_SEPARATOR . $id;
    $tmxu_file = $map_dir . DIRECTORY_SEPARATOR . 'map.tmxu';

    // Clear the temporary dir if it has become too large.
    clear_dir_if_size($config['tmp_dir'], MAX_TMP_DIR_SIZE);

    $request = json_decode(file_get_contents('php://input'));
    if ((is_dir($map_dir) || mkdir($map_dir, 0777, true)) && file_put_contents($tmxu_file, $request->xml)) {
        $response = array(
            'successful' => true
        );
    } else {
        $response = array(
            'successful' => false,
            'message' => 'Could not persist map to disk'
        );
    }

    header('Content-Type: application/json');
    echo json_encode($response);
}

// Functions

// Adapted from:
// http://stackoverflow.com/questions/478121/php-get-directory-size
function dir_size($dir) {
    $total_size = 0;
    $filenames = scandir($dir);
    $cleaned_dir = rtrim($dir, '/') . '/';

    foreach ($filenames as $filename) {
        if ($filename === '.' || $filename === "..") continue;

        $file = $cleaned_dir . $filename;
        $size = is_dir($file) ? dir_size($file) : filesize($file);
        $total_size += $size;
    }

    return $total_size;
}

function clear_dir_if_size($dir, $max_size) {
    $size = is_dir($dir) ? dir_size($dir) : 0;
    if ($size > $max_size) {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($files as $file) {
            $op = $file->isDir() ? 'rmdir' : 'unlink';
            $op($file->getRealPath());
        }
    }
    return $size > $max_size;
}

