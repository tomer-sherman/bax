import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import icon from "data-base64:../../assets/icon.png"
import "./index.css"
import iziToast from "izitoast"
import { baxService } from "./service/bax-service"

type Prompt = {
  content: string
}

type ChatMessage = {
  id: string,
  role: "human" | "bax",
  content: string;
}

function IndexPopup() {
  const [loading, setLoading] = useState<boolean>(false);
 
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Prompt>();

  const [chat, setChat] = useState<ChatMessage[]>([])

  const chatRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    chatRef.current?.lastElementChild?.scrollIntoView({ block: "nearest" })
  }, [chat, loading])

  async function send(userPrompt: Prompt) {

    try {
      setLoading(true);
      reset();
      // Update the chat state from the user.
      const newPrompt: ChatMessage = { id: crypto.randomUUID(), role: "human", content: userPrompt.content };
      const newChat = [...chat, newPrompt];
      setChat(newChat);


      // Update the chat state from the new completion.
      const completion = await baxService.getBaxCompletion(newChat);
      const baxCompletion: ChatMessage = { id: crypto.randomUUID(), role: "bax", content: completion };
      setChat(prev => [...prev, baxCompletion])


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
        <input type="text" {...register("content")}></input>
        <button aria-label="Ask"></button>
        {errors.content?.message && <span role="alert">{errors.content.message}</span>}
      </form>

      <p></p>
      <div className="chat" role="log" ref={chatRef}>
        {chat.map(m => (<div key={m.id}>

          {m.role === "bax" && <p className="baxResponse" >{m.content}</p>}
          {m.role === "human" && <p className="humanMessage" >{m.content}</p>}

        </div>))}
        {loading && <span>Loading...</span>}
      </div>

    </div>
  )
}

export default IndexPopup
