import { useState, type MouseEvent } from "react";
import API_BASE_URL from "../config/api";

type DeleteBtnProps = {
  transactionId: number;
  onDeleted?: () => void;
};

function DeleteBtn({ transactionId, onDeleted }: DeleteBtnProps) {
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDeleteMessage("");

    const token = localStorage.getItem("token");

    try {
      setDeleting(true);

      const result = await fetch(
        `${API_BASE_URL}/api/transactions/${transactionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = (await result
        .json()
        .catch(() => null)) as { message?: string } | null;

      if (!result.ok) {
        setDeleteMessage(
          data?.message || "Could not delete transaction. Please try again.",
        );
        return;
      }

      if (onDeleted) {
        onDeleted();
      }
    } catch {
      setDeleteMessage("Could not connect to the server. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <button type="button" onClick={handleDelete} disabled={deleting}>
        {deleting ? "DELETING..." : "DELETE"}
      </button>
      {deleteMessage && <small className="form-error">{deleteMessage}</small>}
    </>
  );
}

export default DeleteBtn;
