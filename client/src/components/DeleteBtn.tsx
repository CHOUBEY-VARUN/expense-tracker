import API_BASE_URL from "../config/api";

type DeleteBtnProps = {
  transactionId: number;
  onDeleted?: () => void;
};

function DeleteBtn({ transactionId, onDeleted }: DeleteBtnProps){

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const result = await fetch(`${API_BASE_URL}/api/transactions/${transactionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await result.json();

    if (!result.ok) {
      console.log(data.message);
      return;
    }

    console.log("Transaction deleted.")

     if (onDeleted) {
      onDeleted();
    }
  };
  
  return(
    <>
    <button onClick={handleDelete}>DELETE</button>
    </>
  )
}

export default DeleteBtn;