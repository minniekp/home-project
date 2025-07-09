import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert
} from '@mui/material';
// import utility from '../../utility/utility.js';
// import constList from '../../store/constants';
// import CryptoJS from 'crypto-js';

interface Bookmark {
  bookmark_id: number;
  ph: any[];
  lh: any[];
  bookmark_name: string;
  bookmark_page: string;
  phdetail: number;
  islhdetail: number;
}

interface BookmarkSimulator {
  bookmark_id: number;
  oculus_id: number;
  bookmark_name: string;
  bookmark_page: string;
}

interface Props {
  open: boolean;
  onClose: (reset?: boolean) => void;
  onSave?: (payload: any) => Promise<any>;
  onUpdate?: (payload: any) => Promise<any>;
  onSaveSimulator?: (payload: any) => Promise<any>;
  bookmarkdetail?: any;
  mode?: 'create' | 'update';
  page?: string;
  allbookmarks?: any[];
}

const defaultBookmark: Bookmark = {
  bookmark_id: 0,
  ph: [],
  lh: [],
  bookmark_name: '',
  bookmark_page: '',
  phdetail: 0,
  islhdetail: 0,
};

const defaultBookmarkSimulator: BookmarkSimulator = {
  bookmark_id: 0,
  oculus_id: 0,
  bookmark_name: '',
  bookmark_page: 'SIMULATOR',
};

const CreateBookmarkModal: React.FC<Props> = ({
  open,
  onClose,
  onSave,
  onUpdate,
  onSaveSimulator,
  bookmarkdetail = {},
  mode = 'create',
  page = 'TS/EXPORT',
  allbookmarks = [],
}) => {
  const [isloading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ text: string; visible: boolean }>({ text: '', visible: false });
  const [bookmark, setBookmark] = useState<Bookmark>({ ...defaultBookmark });
  const [bookmarksimulator, setBookmarkSimulator] = useState<BookmarkSimulator>({ ...defaultBookmarkSimulator });
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Derived
  const titleText = mode === 'update' ? 'Update Bookmark' : 'Save new Bookmark';
  const buttonText = !isloading
    ? mode === 'update'
      ? 'Update'
      : 'Save'
    : mode === 'update'
    ? 'Updating...'
    : 'Saving...';

  const isFormValid =
    mode === 'create'
      ? page !== 'SIMULATOR'
        ? !!bookmark.bookmark_name && bookmark.bookmark_name.trim() !== ''
        : !!bookmarksimulator.bookmark_name && bookmarksimulator.bookmark_name.trim() !== ''
      : !!bookmarkdetail.bookmark_name && bookmarkdetail.bookmark_name.trim() !== '';

  // Utility functions (replace with your actual utility functions)
  const getErrorMessage = (code: string) => {
    // Replace with your error message logic
    if (code === '1002') return 'Bookmark name already exists.';
    if (code === '1007') return 'Bookmark name cannot start with @, -, +, =';
    return 'Unknown error';
  };

  const checkBookmarkNameChar = (bookmarkName: string) => {
    const re = /^[@|\-|+|=]/;
    return re.test(bookmarkName);
  };

  const isNameExisting = (bm: any) => {
    for (let i = 0; i < allbookmarks.length; i++) {
      const current = allbookmarks[i];
      const currentName = current.bookmark_name ? current.bookmark_name.trim().toLowerCase() : '';
      if (
        bm.bookmark_name.trim().toLowerCase() === currentName &&
        bm.bookmark_id !== current.bookmark_id
      ) {
        return true;
      }
    }
    return false;
  };

  const hasErrors = (bm: any) => {
    if (isNameExisting(bm)) {
      setError({ text: getErrorMessage('1002'), visible: true });
      nameInputRef.current?.focus();
      return true;
    }
    if (checkBookmarkNameChar(bm.bookmark_name)) {
      setError({ text: getErrorMessage('1007'), visible: true });
      nameInputRef.current?.focus();
      return true;
    }
    return false;
  };

  const resetError = () => setError({ text: '', visible: false });

  const handleClose = (reset?: boolean) => {
    if (isloading) return;
    resetError();
    setBookmark((b) => ({ ...b, bookmark_name: '' }));
    setBookmarkSimulator((b) => ({ ...b, bookmark_name: '' }));
    onClose && onClose(reset);
  };

  // Simulate Vuex actions with callbacks
  const createBookmark = () => {
    setIsLoading(true);
    // Fill payload as needed
    let payload = { ...bookmark, ...bookmarkdetail };
    // Add encryption and metrics logic here if needed
    onSave &&
      onSave(payload)
        .then(() => {
          setIsLoading(false);
          setBookmark({ ...defaultBookmark });
          handleClose();
        })
        .catch((err) => showErrorMessage(err));
  };

  const createBookmarkSimulator = () => {
    setIsLoading(true);
    let payload = { ...bookmarksimulator, ...bookmarkdetail };
    onSaveSimulator &&
      onSaveSimulator(payload)
        .then((resp) => {
          if (resp.data && resp.data.message) {
            showErrorMessageCreateBookmark(resp.data.message);
          } else {
            setIsLoading(false);
            setBookmarkSimulator({ ...defaultBookmarkSimulator });
            handleClose();
          }
        })
        .catch((err) => showErrorMessage(err));
  };

  const updateBookmark = () => {
    setIsLoading(true);
    let payload = { ...bookmarkdetail };
    onUpdate &&
      onUpdate(payload)
        .then(() => {
          setIsLoading(false);
          handleClose();
        })
        .catch((err) => showErrorMessage(err));
  };

  const showErrorMessage = (err: any) => {
    setIsLoading(false);
    if (err && err.response && err.response.data && err.response.data.message) {
      setError({ text: err.response.data.message, visible: true });
      nameInputRef.current?.focus();
    }
  };

  const showErrorMessageCreateBookmark = (errMsg: string) => {
    setIsLoading(false);
    if (errMsg) {
      setError({ text: errMsg, visible: true });
      nameInputRef.current?.focus();
    }
  };

  const validate = () => {
    if (!isFormValid || isloading) return;
    let bm;
    if (mode === 'create') {
      bm = page === 'SIMULATOR' ? bookmarksimulator : bookmark;
    } else {
      bm = bookmarkdetail;
    }
    if (hasErrors(bm)) return;
    setIsLoading(true);
    if (page !== 'SIMULATOR' && mode === 'create' && bookmark.bookmark_id === 0) {
      createBookmark();
    } else if (page === 'SIMULATOR' && mode === 'create' && bookmark.bookmark_id === 0) {
      createBookmarkSimulator();
    } else {
      updateBookmark();
    }
  };

  return (
    <Dialog open={open} onClose={() => handleClose()} maxWidth="xs" fullWidth>
      <DialogTitle id="Title-Dtm-Bookmark-Name">{titleText}</DialogTitle>
      <DialogContent>
        <Box mt={1}>
          {error.visible && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.text}
            </Alert>
          )}
          <Typography component="label" htmlFor="Input-Dtm-Bookmark-Name" sx={{ fontWeight: 500 }}>
            Bookmark Name <span aria-label="(Required field)" style={{ color: 'red' }}>*</span>
          </Typography>
          {mode === 'create' && page !== 'SIMULATOR' && (
            <TextField
              id="Input-Dtm-Bookmark-Name"
              inputRef={nameInputRef}
              value={bookmark.bookmark_name}
              inputProps={{ maxLength: 25, 'aria-required': true }}
              fullWidth
              margin="dense"
              onChange={e => {
                setBookmark(b => ({ ...b, bookmark_name: e.target.value }));
                resetError();
              }}
              onKeyUp={resetError}
            />
          )}
          {mode === 'create' && page === 'SIMULATOR' && (
            <TextField
              id="Input-Dtm-Bookmark-Name"
              inputRef={nameInputRef}
              value={bookmarksimulator.bookmark_name}
              inputProps={{ maxLength: 25, 'aria-required': true }}
              fullWidth
              margin="dense"
              onChange={e => {
                setBookmarkSimulator(b => ({ ...b, bookmark_name: e.target.value }));
                resetError();
              }}
              onKeyUp={resetError}
            />
          )}
          {mode !== 'create' && page !== 'SIMULATOR' && (
            <TextField
              id="Input-Dtm-Bookmark-Name"
              inputRef={nameInputRef}
              value={bookmarkdetail.bookmark_name || ''}
              inputProps={{ maxLength: 25, 'aria-required': true }}
              fullWidth
              margin="dense"
              onChange={e => {
                if (bookmarkdetail && typeof bookmarkdetail === 'object') {
                  bookmarkdetail.bookmark_name = e.target.value;
                }
                resetError();
              }}
              onKeyUp={resetError}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          id="Btn-Dtm-Bookmark-Cancel"
          variant="outlined"
          color="secondary"
          onClick={() => handleClose()}
          disabled={isloading}
        >
          Cancel
        </Button>
        <Button
          id={`Btn-Dtm-bookmark-${buttonText}`}
          variant="contained"
          color="primary"
          disabled={isloading || !isFormValid}
          aria-label={buttonText}
          onClick={validate}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateBookmarkModal;