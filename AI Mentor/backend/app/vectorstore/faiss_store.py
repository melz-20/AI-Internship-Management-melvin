import os
import shutil

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


def create_vector_store(chunks, user_id):

    folder = f"vector_db/user_{user_id}"

    if os.path.exists(folder):

        vector_store = FAISS.load_local(
            folder,
            embedding_model,
            allow_dangerous_deserialization=True
        )

        vector_store.add_texts(chunks)

    else:

        vector_store = FAISS.from_texts(
            chunks,
            embedding_model
        )

    vector_store.save_local(folder)

    return vector_store


def load_vector_store(user_id):

    folder = f"vector_db/user_{user_id}"

    if not os.path.exists(folder):
        return None

    return FAISS.load_local(
        folder,
        embedding_model,
        allow_dangerous_deserialization=True
    )


def delete_vector_store(user_id):
    """
    Removes a user's entire FAISS folder from disk.
    Used when a user deletes their last remaining PDF.
    """

    folder = f"vector_db/user_{user_id}"

    if os.path.exists(folder):
        shutil.rmtree(folder)


def rebuild_vector_store(user_id, all_chunks):
    """
    Wipes the user's existing FAISS folder (if any) and rebuilds
    it from scratch using only the chunks passed in. Used after a
    PDF is deleted, since FAISS can't remove individual vectors
    from an existing index -- the only reliable way to "forget" a
    deleted PDF's content is to rebuild from the PDFs that remain.

    If all_chunks is empty (user has no PDFs left), this just
    deletes the folder and returns None.
    """

    delete_vector_store(user_id)

    if not all_chunks:
        return None

    folder = f"vector_db/user_{user_id}"

    vector_store = FAISS.from_texts(
        all_chunks,
        embedding_model
    )

    vector_store.save_local(folder)

    return vector_store
