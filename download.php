<?php

define('MAX_IMAGE_SIZE', 10 * 1024 * 1024); // 10 MB

$id = isset($_GET['id']) ? $_GET['id'] : null;
if (!$id) {
    error_log('Id must be specified');
    exit;
}

$tmp_dir = ini_get('upload_tmp_dir') ?: sys_get_temp_dir();
$tmx_dir = implode(DIRECTORY_SEPARATOR, array($tmp_dir, 'tmx'));
$map_dir = implode(DIRECTORY_SEPARATOR, array($tmx_dir, $id));
$tmxu_file = $map_dir . DIRECTORY_SEPARATOR . 'map.tmxu';
$tmx_file = $map_dir . DIRECTORY_SEPARATOR . 'map.tmx';

// Remove all non-TMX files.
foreach (glob($map_dir . '/*') as $file) {
    if (substr($file, -4) === 'tmxu') continue;
    @unlink($file);
}

$xml = file_get_contents($tmxu_file);
$doc = simplexml_load_string($xml);
$image_nodes = $doc->xpath('//image');

// Download all the tile set images.
$bytes_read = 0;
foreach ($image_nodes as $i => $image_node) {
    $source = $image_node['source'];
    $destination_filename = 'tile-set-' . $i . '.' . strtolower(substr($source, -3));
    if (substr($source, 0, 4) === 'http') {
        $contents = '';
        $source_handle = fopen($source, 'rb');
        while (!feof($source_handle)) {
            if ($bytes_read > MAX_IMAGE_SIZE) {
                error_log('Max image size exceeded: +' . ($bytes_read - MAX_IMAGE_SIZE));
                fclose($source_handle);
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