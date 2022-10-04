import escapeHtml from './utilities/escapeHtml';

class App {
    constructor() {
        // Props
        this.notes = this.getNotes();
        this.actualNoteEdit = null;
        this.actualNoteColor = null;
        // Refs
        this.$notesContainer = document.querySelector('.notes-container');
        this.$placeholder = document.querySelector('.placeholder');
        this.$form = document.querySelector('#new-note');
        this.$formTitle = this.$form.querySelector('.note-title');
        this.$formText = this.$form.querySelector('.note-text');
        this.$formClose = this.$form.querySelector('#close');
        this.$modal = document.querySelector('.modal');
        this.$modalTitle = this.$modal.querySelector('.modal-title');
        this.$modalText = this.$modal.querySelector('.modal-text');
        this.$modalSave = this.$modal.querySelector('#save-modal');
        this.$colorsTooltip = document.querySelector('.color-tooltip');
        this.$colorsTooltipBtns =
            this.$colorsTooltip.querySelectorAll('.color');
        // Init
        this.addEventListeners();
        this.displayNotes();
    }

    // APP EVENTS
    addEventListeners() {
        // Even for notes that do not exist yet in the DOM
        // or external click to close elements
        document.body.addEventListener('click', event => {
            this.handleFormVisibility(event);
            this.openModal(event);
            this.deleteNote(event);
            this.openColorsTooltip(event);
        });

        this.$form.addEventListener('submit', event => {
            event.preventDefault();
            this.addNote();
        });

        this.$formClose.addEventListener('click', event => {
            event.stopPropagation();
            this.closeForm();
        });

        this.$modalSave.addEventListener('click', event => {
            event.stopPropagation();
            this.updateNote();
            this.closeModal();
        });

        this.$colorsTooltipBtns.forEach(btn => {
            btn.addEventListener('click', event => {
                event.stopPropagation();
                this.updateNoteColor(event);
                this.closeColorstooltip();
            });
        });
    }

    // SHOW NOTES
    displayNotes() {
        this.$placeholder.style.display =
            this.notes.length > 0 ? 'none' : 'block';

        this.$notesContainer.innerHTML = this.notes
            .map(
                note =>
                    `<div class="note" style="background-color: ${
                        note.color
                    }" data-id="${note.id}">
                        ${
                            note.title
                                ? `<h2 class="note-title">${note.title}</h2>`
                                : ''
                        }
                        <p class="note-text">${note.text}</p>
                        <div class="note-actions">
                            <svg class="action note-edit" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z" fill="#333"/></svg>
                            <svg class="action note-delete" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z" fill="#333"/></svg>

                            <svg class="action note-color" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M19.228 18.732l1.768-1.768 1.767 1.768a2.5 2.5 0 1 1-3.535 0zM8.878 1.08l11.314 11.313a1 1 0 0 1 0 1.415l-8.485 8.485a1 1 0 0 1-1.414 0l-8.485-8.485a1 1 0 0 1 0-1.415l7.778-7.778-2.122-2.121L8.88 1.08zM11 6.03L3.929 13.1H18.07L11 6.03z" fill="#333"/></svg>
                        </div>
                    </div>`
            )
            .join('');
    }

    // CREATE NOTE
    handleFormVisibility(event) {
        const isFormClicked = this.$form.contains(event.target);

        if (isFormClicked) {
            this.$form.classList.add('active');
        } else {
            this.closeForm();
        }
    }

    addNote() {
        const title = escapeHtml(this.$formTitle.value.trim());
        const text = escapeHtml(this.$formText.textContent.trim());

        if (!text) return;

        const newNote = {
            title,
            text,
            color: 'white',
            id: Date.now(),
        };
        this.notes.unshift(newNote);
        this.displayNotes();
        this.closeForm();
        this.saveNotes();
    }

    closeForm() {
        this.$form.classList.remove('active');
        this.$formTitle.value = '';
        this.$formText.textContent = '';
        this.$formTitle.blur(); // in case of submit with enter
        this.$formText.blur();
    }

    // EDIT NOTE
    openModal(event) {
        if (!event.target.matches('.note-edit, note-edit *')) return;

        this.$modal.classList.toggle('active');

        const note = event.target.closest('.note');
        const noteTitle = note.querySelector('.note-title');
        const noteText = note.querySelector('.note-text');
        this.actualNoteEdit = note.dataset.id;

        this.$modalTitle.value = noteTitle ? noteTitle.innerText : '';
        this.$modalText.textContent = noteText.innerText;
    }

    updateNote() {
        if (!this.$modalText.textContent.trim()) return;
        const note = this.notes.find(note => note.id == this.actualNoteEdit);
        note.title = escapeHtml(this.$modalTitle.value.trim());
        note.text = escapeHtml(this.$modalText.textContent.trim());
        this.displayNotes();
        this.saveNotes();
    }

    closeModal() {
        this.$modal.classList.remove('active');
        this.$modalTitle.value = '';
        this.$modalText.value = '';
        this.actualNoteEdit = null;
    }

    // DELETE NOTE
    deleteNote(event) {
        if (!event.target.matches('.note-delete, .note-delete *')) return;

        const selectedNote = event.target.closest('.note');
        this.notes = this.notes.filter(
            note => note.id !== parseInt(selectedNote.dataset.id)
        );
        this.displayNotes();
        this.saveNotes();
    }

    // CHANGE NOTE COLOR
    openColorsTooltip(event) {
        if (event.target.matches('.note-color, .note-color *')) {
            this.$colorsTooltip.style.top = `${event.clientY}px`;
            this.$colorsTooltip.style.left = `${event.clientX}px`;
            this.$colorsTooltip.classList.add('active');

            this.actualNoteColor = event.target.closest('.note').dataset.id;
        } else {
            this.closeColorstooltip();
        }
    }

    updateNoteColor(event) {
        const note = this.notes.find(note => note.id == this.actualNoteColor);
        note.color = event.target.style.backgroundColor;
        this.displayNotes();
        this.saveNotes();
    }

    closeColorstooltip() {
        this.$colorsTooltip.classList.remove('active');
        this.actualNoteColor = null;
    }

    // NOTES STORE
    getNotes() {
        return JSON.parse(localStorage.getItem('notes')) || [];
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }
}

new App();
