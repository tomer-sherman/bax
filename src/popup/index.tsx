import { useState } from "react"
import { useForm } from "react-hook-form"
import icon from "data-base64:../../assets/icon.png"
import "./index.css"
import iziToast from "izitoast"
import { baxService } from "./service/bax-service"

type Prompt = {
  userPrompt: string
}

type ChatMessage = {
  id: string,
  role: "human" | "bax",
  content: string;
}

function IndexPopup() {
  const [loading, setLoading] = useState<boolean>(false);
  const [completion, setCompletion] = useState<string>("");
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Prompt>();

  const [chat, setChat] = useState<ChatMessage[]>([])

  async function send(prompt: Prompt) {

    try {
      setLoading(true);
      reset();
      // Update the chat state from the user.
      const userPrompt: ChatMessage = { id: crypto.randomUUID(), role: "human", content: prompt.userPrompt };
      const newChat = [...chat, userPrompt];
      setChat(newChat);


      // Update the chat state from the user.
      const completion = await baxService.getBaxCompletion(prompt.userPrompt);
      const baxCompletion: ChatMessage = { id: crypto.randomUUID(), role: "bax", content: completion };
      setChat(prev => [...prev, baxCompletion])


      setCompletion(completion);
    } catch (err: any) {
      iziToast.error({ message: err.message })
    }
    finally {
      setLoading(false)

    }
  }





  return (
    <div className="IndexPopup">

      <form onSubmit={handleSubmit(send)}>
        <label><span className="brand-icon"><img src={icon} alt="" /></span>Ask Bax</label>
        <input type="text" {...register("userPrompt")}></input>
        <button aria-label="Ask"></button>
        {errors.userPrompt && <span role="alert">{errors.userPrompt.message}</span>}
      </form>

      <p>{completion}</p>
      {loading && <span>Loading...</span>}

      {chat.map(m => (<div key={m.id}>

        {m.role === "bax" && <p className="baxResponse" >{m.content}</p>}
        {m.role === "human" && <p className="humanMessage" >{m.content}</p>}

      </div>))}

    </div>
  )
}

export default IndexPopup
