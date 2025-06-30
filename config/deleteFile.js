// backend/config/deleteFile.js

const fs = require('fs');
const path = require('path');

/**
 * Deletes a single file from the public directory.
 * Logs success or error.
 * @param {string} filename - The name of the file to delete within the public folder.
 */
const deleteFile = (filename) => {
    console.log('filename',filename)
    // Guard clause: Don't proceed if filename is empty, null, or undefined
    if (!filename) {
        console.warn("deleteFile called with no filename.");
        return;
    }

    try {
        // Construct the absolute path to the file within the 'public' folder
        // __dirname is 'backend/config', so '../public' goes up to 'backend' then into 'public'
        const filePath = path.join(__dirname, '..', 'public', filename);

        console.log(`Attempting to delete file at path: ${filePath}`); // Log the path being attempted

        // Use fs.promises.unlink for async/await compatibility if preferred,
        // but fs.unlink is fine for background cleanup.
        fs.unlink(filePath, (err) => {
            if (err) {
                // ENOENT means file not found, which is okay if it was already deleted somehow
                if (err.code === 'ENOENT') {
                    console.warn(`File not found, deletion skipped (may already be deleted): ${filePath}`);
                } else {
                    // Log other errors (e.g., permissions)
                    console.error(`Error deleting file ${filePath}:`, err);
                }
            } else {
                console.log(`Successfully deleted file: ${filePath}`);
            }
        });
    } catch (error) {
        // Catch synchronous errors, e.g., path construction issues (though unlikely here)
        console.error(`Synchronous error in deleteFile function for filename ${filename}:`, error);
    }
};

// Export the function
module.exports = deleteFile;